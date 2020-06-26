import csvParse from 'csv-parse';
import fs from 'fs';
import { getCustomRepository, getRepository } from 'typeorm';

import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';
import Category from '../models/Category';

interface CSVTransaction {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class ImportTransactionsService {
  async execute(filePath: string): Promise<Transaction[]> {
    const contactsReadStream = fs.createReadStream(filePath);

    const parsers = csvParse({
      from_line: 2,
    });

    const parseCSV = contactsReadStream.pipe(parsers);

    const transactions: CSVTransaction[] = [];

    parseCSV.on('data', async line => {
      const [title, type, value, category] = line.map((cell: string) =>
        cell.trim(),
      );

      if (!title || !type || !value || !category) return;

      transactions.push({ title, type, value, category });
    });

    await new Promise(resolve => parseCSV.on('end', resolve));

    const categoryRepository = getRepository(Category);
    const transactionsRepository = getCustomRepository(TransactionsRepository);

    const transactionsCreated: Transaction[] = [];

    for (let i = 0; i < transactions.length; i++) {
      let categoryExists = await categoryRepository.findOne({
        where: { title: transactions[i].category },
      });

      if (!categoryExists) {
        categoryExists = categoryRepository.create({
          title: transactions[i].category,
        });
        await categoryRepository.save(categoryExists);
      }

      let transactionToBeCreated = transactionsRepository.create({
        title: transactions[i].title,
        type: transactions[i].type,
        value: transactions[i].value,
        category_id: categoryExists.id,
      });

      transactionToBeCreated = await transactionsRepository.save(
        transactionToBeCreated,
      );

      transactionsCreated.push(transactionToBeCreated);
    }

    return transactionsCreated;
  }
}

export default ImportTransactionsService;
