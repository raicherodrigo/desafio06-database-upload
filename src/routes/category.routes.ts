import { Router, Request, Response } from 'express';
import CreateCategoryService from '../services/CreateCategoryService';

const categoryRouter = Router();

categoryRouter.post('/', async (request: Request, response: Response) => {
  const { title } = request.body;

  const createCategory = new CreateCategoryService();

  const category = await createCategory.execute({
    title,
  });

  return response.json(category);
});

export default categoryRouter;
