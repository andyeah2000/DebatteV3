import { ObjectType, Field } from '@nestjs/graphql'

@ObjectType()
export class SystemHealth {
  @Field()
  status: string

  @Field()
  uptime: number

  @Field()
  databaseStatus: string

  @Field()
  memoryUsage: number

  @Field()
  cpuUsage: number

  @Field(() => [String])
  activeServices: string[]

  @Field(() => [ServiceStatus])
  services: ServiceStatus[]
}

@ObjectType()
class ServiceStatus {
  @Field()
  name: string

  @Field()
  status: string

  @Field()
  latency: number

  @Field(() => [String], { nullable: true })
  errors?: string[]
} 