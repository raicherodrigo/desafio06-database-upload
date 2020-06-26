import { EntityRepository, Repository, getCustomRepository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

interface CreateTransactionDTO {
  title: string;
  value: number;
  type: 'income' | 'outcome';
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async validateValue(
    valueRec: number,
    type: 'income' | 'outcome',
  ): Promise<boolean> {
    const balance = await this.getBalance();
    if (type === 'outcome' && valueRec > balance.total) {
      return true;
    }
    return false;
  }

  public async getBalance(): Promise<Balance> {
    const transactions = await this.find();

    const income = transactions
      .filter(({ type }) => type === 'income')
      .reduce((sum, currentValue) => {
        return sum + currentValue.value;
      }, 0);

    const outcome = transactions
      .filter(({ type }) => type === 'outcome')
      .reduce((sum, currentValue) => {
        return sum + currentValue.value;
      }, 0);

    const total = income - outcome;

    const balance = { income, outcome, total };

    return balance;
  }
}

export default TransactionsRepository;
