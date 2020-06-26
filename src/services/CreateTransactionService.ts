import { getCustomRepository, getRepository } from 'typeorm';

import Category from '../models/Category';
import TransactionsRepository from '../repositories/TransactionsRepository';
import Transaction from '../models/Transaction';

import AppError from '../errors/AppError';

interface RequestDTO {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: RequestDTO): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);

    const result = await transactionsRepository.validateValue(value, type);

    if (result) {
      throw new AppError('There is not enough balance');
    }

    const categoryRepository = getRepository(Category);
    let checkCategoryExists = await categoryRepository.findOne({
      where: { title: category },
    });

    if (!checkCategoryExists) {
      checkCategoryExists = categoryRepository.create({
        title: category,
      });
      await categoryRepository.save(checkCategoryExists);
    }
    const transaction = transactionsRepository.create({
      title,
      value,
      type,
      category: checkCategoryExists,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
