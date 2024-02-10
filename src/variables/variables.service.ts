import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateVariableDto } from './dto/create-variable.dto';
import { UpdateVariableDto } from './dto/update-variable.dto';
import { Variable } from './entities/variables.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class VariablesService {
  constructor(
    @InjectRepository(Variable)
    private readonly variablesRepository: Repository<Variable>,
  ) {}

  async create({ label, value }: CreateVariableDto) {
    try {
      const variable = await this.variablesRepository.findOneBy({ label });
      if (!variable) {
        const newVariable = new Variable(label, value);
        return await this.variablesRepository.save(newVariable);
      } else {
        variable.value = value;
        return await this.variablesRepository.save(variable);
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findAll() {
    try {
      return await this.variablesRepository.find();
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findOne(id: number) {
    try {
      const variable = await this.variablesRepository.findOneBy({ id });
      if (!variable) {
        throw new NotFoundException("This variable doesn't exist!");
      }
      return variable;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findOneByLabel(label: string) {
    try {
      const variable = await this.variablesRepository.findOneBy({ label });
      if (!variable) {
        throw new NotFoundException("This variable doesn't exist!");
      }
      return variable;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async update(id: number, updateVariableDto: UpdateVariableDto) {
    try {
      const variable = await this.findOne(id);
      variable.label = updateVariableDto?.label ?? variable.label;
      variable.value = updateVariableDto?.value ?? variable.value;
      return await this.variablesRepository.save(variable);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async remove(id: number) {
    try {
      await this.findOne(id);
      const deleted = await this.variablesRepository.delete(id);
      if (deleted.affected) {
        return {
          success: true,
          message: `The variable with id: ${id} has been deleted`,
        };
      } else {
        return {
          success: false,
          message: `The variable with id: ${id} has NOT been deleted`,
        };
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
