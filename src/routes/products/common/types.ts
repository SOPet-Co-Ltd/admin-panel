import { z } from 'zod';

import { EditProductMediaSchema } from './constants';

export type EditProductMediaSchemaType = z.infer<typeof EditProductMediaSchema>;
