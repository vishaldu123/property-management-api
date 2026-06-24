import { Router } from 'express';
import { requireAuth, authorize } from '../middleware/auth.middleware';
import {
  createProperty,
  deleteProperty,
  getProperty,
  listProperties,
  updateProperty,
} from '../controllers/property.controller';

const router = Router();

router.use(requireAuth);
router.get('/', authorize('PROPERTY_READ'), listProperties);
router.get('/:propertyId', authorize('PROPERTY_READ'), getProperty);
router.post('/', authorize('PROPERTY_CREATE'), createProperty);
router.put('/:propertyId', authorize('PROPERTY_UPDATE'), updateProperty);
router.delete('/:propertyId', authorize('PROPERTY_DELETE'), deleteProperty);

export default router;
