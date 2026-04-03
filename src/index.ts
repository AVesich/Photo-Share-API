import { serve } from '@hono/node-server'
import { Hono, type Context } from 'hono'
import { createUserRoute, deleteUserRoute, getUserRoute, updateUserRoute } from './lib/users/routes.ts';
import { validateAuthRoute, refreshAuthRoute } from './lib/auth/routes.ts';
import { createAlbumRoute, deleteAlbumRoute, getAlbumContentsRoute, getUserAlbumsRoute, updateAlbumRoute } from './lib/albums/routes.ts';
import { createContentRoute, deleteContentRoute, getContentRoute, updateContentRoute } from './lib/content/routes.ts';
import { createUser, deleteUser, getUserById, updateUser } from './lib/users/functions.ts';
import { z } from 'zod/mini';
import type { BlankEnv, BlankInput } from 'hono/types';
import { auth, validateToken } from './lib/auth/functions.ts';
import { AuthResultSchema, type AuthResult } from './lib/auth/types/auth.ts';
import type { UserInfo } from './lib/users/types/user.ts';
import type { SuccessResult } from './lib/types.ts';
import { configDotenv } from 'dotenv';

// Load environment & create app
configDotenv();
const app = new Hono();

// API Utils
const BASE_API: string = '/api';

const getError = (context: Context<BlankEnv, string, BlankInput>, error: Error) => {
  if (error instanceof z.core.$ZodError) {
    context.status(400);
    return { error: 'Invalid data structure found: ' + error.message };
  }

  context.status(500);
  return { error: 'Miscellaneous error: ' + error.message };
};

// Register the routes
// Auth
app.post(BASE_API + validateAuthRoute, async (context) => {
  const parsedJSON: any = await context.req.json();
  const jwt: AuthResult = AuthResultSchema.parse(parsedJSON);

  try {
    const result: SuccessResult = await validateToken(jwt.token);
    return context.json(result);
  } catch (error: any) {
    return context.json(getError(context, error));
  }
});

app.post(BASE_API + refreshAuthRoute, async (context) => {
  const parsedJSON: any = await context.req.json();

  try {
      const tokenResult: AuthResult = await auth(parsedJSON);
      return context.json(tokenResult);
    } catch (error: any) {
      return context.json(getError(context, error));
  }
});

// User
app.get(BASE_API + getUserRoute, async (context) => {
  const userID = context.req.param('userID')!;

  try {
    const user: UserInfo | null = await getUserById(userID);

    if (user !== null) {
      return context.json(user);
    } else {
      context.status(404);
      return context.json({ error: 'User not found' });
    }
  } catch (error: any) {
    return context.json(getError(context, error));
  }
});

app.post(BASE_API + createUserRoute, async (context) => {
  const parsedJSON: any = await context.req.json();

  try {
    const user: UserInfo = await createUser(parsedJSON);
    return context.json(user);
  } catch (error: any) {
    return context.json(getError(context, error)); 
  }
});

app.put(BASE_API + updateUserRoute, async (context) => {
  const userID = context.req.param('userID')!;
  const parsedJSON: any = await context.req.json();

  try {
    const result: SuccessResult = await updateUser(userID, parsedJSON);
    return context.json(result);
  } catch (error: any) {
    return context.json(getError(context, error)); 
  }
});

app.delete(BASE_API + deleteUserRoute, async (context) => {
  const userID = context.req.param('userID')!;

  try {
    const result: SuccessResult = await deleteUser(userID);
    return context.json(result);
  } catch (error: any) {
    return context.json(getError(context, error)); 
  }
});

// Albums
app.get(BASE_API + getUserAlbumsRoute, async (context) => {
  const userId = context.req.param('userId');
  const pageNumber = context.req.param('pageNumber');
  const pageSize = context.req.param('pageSize');
});

app.get(BASE_API + getAlbumContentsRoute, async (context) => {
  const albumId = context.req.param('albumId');
  const pageNumber = context.req.param('pageNumber');
  const pageSize = context.req.param('pageSize');
});

app.post(BASE_API + createAlbumRoute, async (context) => {
  const userId = context.req.param('userId');
});

app.put(BASE_API + updateAlbumRoute, async (context) => {
  const albumId = context.req.param('albumId');
});

app.delete(BASE_API + deleteAlbumRoute, async (context) => {
  const albumId = context.req.param('albumId');
});

// Content
app.get(BASE_API + getContentRoute, async (context) => {
  const contentId = context.req.param('contentId');
});

app.post(BASE_API + createContentRoute, async (context) => {
});

app.put(BASE_API + updateContentRoute, async (context) => {
  const contentId = context.req.param('contentId');
});

app.delete(BASE_API + deleteContentRoute, async (context) => {
  const contentId = context.req.param('contentId');
});

// Start the server
const server = serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  server.close()
  process.exit(0)
});

process.on('SIGTERM', () => {
  server.close((err) => {
    if (err) {
      console.error(err)
      process.exit(1)
    }
    process.exit(0)
  })
});