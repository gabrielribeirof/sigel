import { Repository } from 'typeorm'
import { CustomerTypeormEntity } from '../config/typeorm/entities/customer.typeorm-entity.js'
import { SupplierTypeormEntity } from '../config/typeorm/entities/supplier.typeorm-entity.js'
import { Identifier } from '../domain/shared/identifier.js'
import { ConflictError, InvalidParametersError, NotFoundError } from '../shared/errors/app.error.js'

export type PartyInput = {
  name: string
  document: string
  email?: string | null
  phone?: string | null
  address?: string | null
}
export type CustomerInput = PartyInput & { type: 'PF' | 'PJ' }
export type PartyUpdateInput = Partial<PartyInput>
export type CustomerUpdateInput = PartyUpdateInput & { type?: 'PF' | 'PJ' }

type PartyEntity = CustomerTypeormEntity | SupplierTypeormEntity

function validateDocument(value: string, type: 'PF' | 'PJ'): string {
  const document = value.replace(/\D/g, '')
  const expected = type === 'PF' ? 11 : 14
  if (document.length !== expected || /^(\d)\1+$/.test(document)) {
    throw new InvalidParametersError({ document: [`Informe um ${type === 'PF' ? 'CPF' : 'CNPJ'} válido.`] })
  }
  const digit = (base: string, weights: number[]) => {
    const sum = [...base].reduce((acc, char, i) => acc + Number(char) * weights[i], 0)
    const remainder = sum % 11
    return remainder < 2 ? 0 : 11 - remainder
  }
  if (type === 'PF') {
    const first = digit(document.slice(0, 9), [10, 9, 8, 7, 6, 5, 4, 3, 2])
    const second = digit(document.slice(0, 10), [11, 10, 9, 8, 7, 6, 5, 4, 3, 2])
    if (first !== Number(document[9]) || second !== Number(document[10])) {
      throw new InvalidParametersError({ document: ['CPF inválido.'] })
    }
  } else {
    const first = digit(document.slice(0, 12), [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2])
    const second = digit(document.slice(0, 13), [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2])
    if (first !== Number(document[12]) || second !== Number(document[13])) {
      throw new InvalidParametersError({ document: ['CNPJ inválido.'] })
    }
  }
  return document
}

function normalize(input: PartyUpdateInput): PartyUpdateInput {
  const output = { ...input }
  if (output.name !== undefined) {
    output.name = output.name.trim()
    if (!output.name || output.name.length > 200) throw new InvalidParametersError({ name: ['Informe um nome de até 200 caracteres.'] })
  }
  if (output.email !== undefined) {
    output.email = output.email?.trim().toLowerCase() || null
    if (output.email && (output.email.length > 255 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(output.email))) {
      throw new InvalidParametersError({ email: ['E-mail inválido.'] })
    }
  }
  if (output.phone !== undefined) {
    output.phone = output.phone?.trim() || null
    if (output.phone && output.phone.length > 20) throw new InvalidParametersError({ phone: ['Telefone muito longo.'] })
  }
  if (output.address !== undefined) {
    output.address = output.address?.trim() || null
    if (output.address && output.address.length > 400) throw new InvalidParametersError({ address: ['Endereço muito longo.'] })
  }
  return output
}

export class PartyService<T extends PartyEntity> {
  public constructor(private readonly repository: Repository<T>, private readonly kind: 'customer' | 'supplier') {}

  public findAll(): Promise<T[]> {
    return this.repository.find({ order: { name: 'ASC' } as never })
  }

  public async findById(id: string): Promise<T> {
    const record = await this.repository.findOneBy({ id: Identifier.from(id).value } as never)
    if (!record) throw new NotFoundError(this.kind === 'customer' ? 'Cliente' : 'Fornecedor')
    return record
  }

  public async create(input: CustomerInput | PartyInput): Promise<T> {
    const type = this.kind === 'supplier' ? 'PJ' : (input as CustomerInput).type
    if (type !== 'PF' && type !== 'PJ') throw new InvalidParametersError({ type: ['Informe PF ou PJ.'] })
    const document = validateDocument(input.document, type)
    if (await this.repository.findOneBy({ document } as never)) throw new ConflictError('CPF/CNPJ já cadastrado.')
    const data = normalize(input)
    const now = new Date()
    const entity = this.repository.create()
    Object.assign(entity, data, { document, ...(this.kind === 'customer' ? { type } : {}), id: Identifier.generate().value, createdAt: now, updatedAt: now })
    return this.repository.save(entity)
  }

  public async update(id: string, input: CustomerUpdateInput | PartyUpdateInput): Promise<T> {
    const current = await this.findById(id)
    const type = this.kind === 'supplier' ? 'PJ' : ((input as CustomerUpdateInput).type ?? (current as CustomerTypeormEntity).type)
    if (type !== 'PF' && type !== 'PJ') throw new InvalidParametersError({ type: ['Informe PF ou PJ.'] })
    const document = validateDocument(input.document ?? current.document, type)
    if (document !== current.document) {
      const duplicate = await this.repository.findOneBy({ document } as never)
      if (duplicate && duplicate.id !== id) throw new ConflictError('CPF/CNPJ já cadastrado.')
    }
    const updates = normalize(input)
    Object.assign(current, updates, { document, ...(this.kind === 'customer' ? { type } : {}), updatedAt: new Date() })
    return this.repository.save(current)
  }

  public async delete(id: string): Promise<void> {
    await this.findById(id)
    await this.repository.delete(Identifier.from(id).value)
  }
}
