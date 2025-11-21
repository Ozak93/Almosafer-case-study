import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from './customer.entity';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(Customer)
    private readonly customersRepository: Repository<Customer>,
  ) {}

  async create(createCustomerDto: CreateCustomerDto): Promise<Customer> {
    const customer = this.customersRepository.create(createCustomerDto);
    return this.customersRepository.save(customer);
  }

  async update(
    id: number,
    updateCustomerDto: UpdateCustomerDto,
  ): Promise<Customer> {
    const customer = await this.customersRepository.findOne({ where: { id } });

    if (!customer) {
      throw new NotFoundException(`Customer with id ${id} not found`);
    }

    Object.assign(customer, updateCustomerDto);
    return this.customersRepository.save(customer);
  }

  findByPhone(phone: string): Promise<Customer | null> {
    return this.customersRepository.findOne({ where: { phone } });
  }
}
