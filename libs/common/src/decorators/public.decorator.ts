import { IS_PUBLIC_KEY } from '@customer-service/common/constants/all.constants';
import { SetMetadata } from '@nestjs/common';

export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
