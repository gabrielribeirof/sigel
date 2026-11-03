import { randomUUID } from 'node:crypto'
import type { Repository } from 'typeorm'
import { StatusCode, type HttpServer, type Request, type Response } from '../../infrastructure/http/http.types.js'
import { CategoryTypeormEntity } from '../../config/typeorm/entities/category.typeorm-entity.js'
import { EquipmentTypeormEntity } from '../../config/typeorm/entities/equipment.typeorm-entity.js'
import { PromotionTypeormEntity } from '../../config/typeorm/entities/promotion.typeorm-entity.js'
import { TypeORMDataSource } from '../../config/typeorm/data-source.js'

type RecordData = Record<string, unknown>
type CatalogEntity = CategoryTypeormEntity | EquipmentTypeormEntity | PromotionTypeormEntity
const fields = {
 categories: ['name', 'description'],
 equipments: ['code', 'name', 'categoryId', 'dailyRate', 'status', 'storageInstructions'],
 promotions: ['name', 'startDate', 'endDate', 'discountPercent', 'rentalTarget'],
} as const
function payload(value: unknown, keys: readonly string[]): RecordData {
 if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Informe os dados do cadastro.')
 return Object.fromEntries(Object.entries(value).filter(([key]) => keys.includes(key)))
}
function required(data: RecordData, key: string): void {
 if (data[key] === undefined || data[key] === null || String(data[key]).trim() === '') throw new Error(`Campo obrigatório: ${key}`)
}
export class CatalogController {
 constructor(http: HttpServer, private categories: Repository<CategoryTypeormEntity>, private equipments: Repository<EquipmentTypeormEntity>, private promotions: Repository<PromotionTypeormEntity>) {
  for (const name of ['categories','equipments','promotions'] as const) {
   http.register('GET', `/${name}`, () => this.list(name))
   http.register('POST', `/${name}`, req => this.save(name, req))
   http.register('PUT', `/${name}/:id`, req => this.save(name, req))
   http.register('DELETE', `/${name}/:id`, req => this.remove(name, req))
  }
 }
 private repository(name: keyof typeof fields): Repository<any> { return {categories:this.categories,equipments:this.equipments,promotions:this.promotions}[name] }
 async list(name: keyof typeof fields): Promise<Response> {
  const rows: CatalogEntity[] = await this.repository(name).find({order:{name:'ASC'}})
  if(name === 'promotions') {
   const enriched = await Promise.all(rows.map(async row => ({...row, equipmentIds: (await TypeORMDataSource.query('SELECT equipment_id FROM promotion_equipments WHERE promotion_id = $1', [row.id]) as {equipment_id:string}[]).map(r => r.equipment_id)})))
   return {statusCode:StatusCode.Ok,body:enriched}
  }
  return {statusCode:StatusCode.Ok,body:rows}
 }
 async save(name: keyof typeof fields, req: Request): Promise<Response> {
  try {
   const data = payload(req.body,fields[name]); const id = req.params.id ?? randomUUID()
   const repo = this.repository(name)
   const existing = req.params.id ? await repo.findOneBy({id}) : null
   if(req.params.id && !existing) return {statusCode:StatusCode.NotFound,body:{message:'Registro não encontrado'}}
   for(const key of name === 'categories' ? ['name'] : name === 'equipments' ? ['code','name','categoryId','dailyRate','status'] : ['name','startDate','endDate','discountPercent','rentalTarget']) required({...existing,...data},key)
   if(name === 'equipments') {
    if(data.dailyRate !== undefined && (!Number.isFinite(Number(data.dailyRate)) || Number(data.dailyRate)<0)) throw new Error('Diária inválida')
    if(data.status !== undefined && !['disponivel','locado','manutencao','baixado'].includes(String(data.status))) throw new Error('Situação inválida')
    const categoryId = String(data.categoryId ?? existing?.categoryId)
    if(!await this.categories.findOneBy({id:categoryId})) throw new Error('Categoria não encontrada')
   }
   if(name === 'promotions') {
    const v={...existing,...data}
    if(String(v.endDate)<String(v.startDate)) throw new Error('Data final anterior à inicial')
    if(Number(v.discountPercent)<0 || Number(v.discountPercent)>100 || !Number.isFinite(Number(v.discountPercent))) throw new Error('Desconto deve estar entre 0 e 100')
    if(!Number.isInteger(Number(v.rentalTarget)) || Number(v.rentalTarget)<=0) throw new Error('Meta inválida')
   }
   const row = await repo.save({...existing,...data,id,...(name === 'promotions' && !existing ? {rentalCount:0}: {})})
   if(name === 'promotions' && (req.body as RecordData).equipmentIds !== undefined) {
    const ids=(req.body as RecordData).equipmentIds
    if(!Array.isArray(ids) || ids.some(x=>typeof x !== 'string')) throw new Error('Equipamentos inválidos')
    const unique=[...new Set(ids)]
    for(const equipmentId of unique) if(!await this.equipments.findOneBy({id:equipmentId})) throw new Error('Equipamento inexistente')
    await TypeORMDataSource.transaction(async manager=>{
     await manager.query('DELETE FROM promotion_equipments WHERE promotion_id = $1',[id])
     for(const equipmentId of unique) await manager.query('INSERT INTO promotion_equipments (promotion_id,equipment_id) VALUES ($1,$2)',[id,equipmentId])
    })
   }
   return {statusCode:existing?StatusCode.Ok:StatusCode.Created,body:row}
  } catch(error) { return {statusCode:StatusCode.BadRequest,body:{message:error instanceof Error?error.message:'Dados inválidos'}} }
 }
 async remove(name: keyof typeof fields,req:Request):Promise<Response> {
  try {const result=await this.repository(name).delete(req.params.id); return {statusCode:result.affected?StatusCode.Ok:StatusCode.NotFound,body:null}}
  catch {return {statusCode:StatusCode.BadRequest,body:{message:'Registro vinculado a outros dados; não pode ser excluído.'}}}
 }
}
