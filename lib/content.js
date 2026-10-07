// Cached read for the public site. Saving in the admin calls revalidateTag('content').
import { unstable_cache } from 'next/cache';
import { readContent } from './store';
import { applyTokens } from './tokens';

export const getContent = unstable_cache(async () => applyTokens(await readContent()), ['site-content'], { tags: ['content'] });
