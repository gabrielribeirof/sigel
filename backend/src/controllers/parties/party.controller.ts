import vine from '@vinejs/vine'
import { PartyService, type CustomerInput, type PartyInput } from '../../services/party.service.js'
import { StatusCode, type HttpServer, type Request, type Response } from '../../infrastructure/http/http.types.js'
import { validate } from '../../shared/validation/validate.js'
import { CustomerTypeormEntity } from '../../config/typeorm/entities/customer.typeorm-entity.js'
import { SupplierTypeormEntity } from '../../config/typeorm/entities/supplier.typeorm-entity.js'

const idSchema = vine.object({ id: vine.string() })
const fields = {
  name: vine.string().trim().minLength(1).maxLength(200),
  document: vine.string().trim(),
  email: vine.string().nullable().optional(),
  phone: vine.string().nullable().optional(),
  address: vine.string().nullable().optional(),
}
const customerCreate = vine.object({ ...fields, type: vine.enum(['PF', 'PJ']) })
const supplierCreate = vine.object(fields)
const updateFields = {
  name: vine.string().trim().minLength(1).maxLength(200).optional(),
  document: vine.string().trim().optional(),
  email: vine.string().nullable().optional(),
  phone: vine.string().nullable().optional(),
  address: vine.string().nullable().optional(),
}
const customerUpdate = vine.object({ ...updateFields, type: vine.enum(['PF', 'PJ']).optional() })
const supplierUpdate = vine.object(updateFields)

export class PartyController {
  public constructor(
    private readonly customers: PartyService<CustomerTypeormEntity>,
    private readonly suppliers: PartyService<SupplierTypeormEntity>,
    httpServer: HttpServer,
  ) {
    for (const resource of ['customers', 'suppliers'] as const) {
      httpServer.register('GET', `/${resource}`, () => this.list(resource))
      httpServer.register('GET', `/${resource}/:id`, request => this.get(resource, request))
      httpServer.register('POST', `/${resource}`, request => this.create(resource, request))
      httpServer.register('PUT', `/${resource}/:id`, request => this.update(resource, request))
      httpServer.register('DELETE', `/${resource}/:id`, request => this.remove(resource, request))
    }
  }

  private service(resource: 'customers' | 'suppliers') {
    return resource === 'customers' ? this.customers : this.suppliers
  }
  public async list(resource: 'customers' | 'suppliers'): Promise<Response> {
    return { statusCode: StatusCode.Ok, body: await this.service(resource).findAll() }
  }
  public async get(resource: 'customers' | 'suppliers', request: Request): Promise<Response> {
    await validate(idSchema, request.params)
    return { statusCode: StatusCode.Ok, body: await this.service(resource).findById(request.params.id) }
  }
  public async create(resource: 'customers' | 'suppliers', request: Request): Promise<Response> {
    if (resource === 'customers') {
      const body = await validate(customerCreate, request.body)
      return { statusCode: StatusCode.Created, body: await this.customers.create(body as CustomerInput) }
    }
    const body = await validate(supplierCreate, request.body)
    return { statusCode: StatusCode.Created, body: await this.suppliers.create(body as PartyInput) }
  }
  public async update(resource: 'customers' | 'suppliers', request: Request): Promise<Response> {
    await validate(idSchema, request.params)
    if (resource === 'customers') {
      const body = await validate(customerUpdate, request.body)
      return { statusCode: StatusCode.Ok, body: await this.customers.update(request.params.id, body) }
    }
    const body = await validate(supplierUpdate, request.body)
    return { statusCode: StatusCode.Ok, body: await this.suppliers.update(request.params.id, body) }
  }
  public async remove(resource: 'customers' | 'suppliers', request: Request): Promise<Response> {
    await validate(idSchema, request.params)
    await this.service(resource).delete(request.params.id)
    return { statusCode: StatusCode.Ok, body: null }
  }
}
