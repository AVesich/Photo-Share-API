import { serve } from '@hono/node-server'
import { Hono, type Context } from 'hono'
import { createUserRoute, deleteUserRoute, getUserRoute, updateUserRoute } from './lib/users/routes.js';
import { validateAuthRoute, refreshAuthRoute } from './lib/jwt/routes.js';
import { createAlbumRoute, deleteAlbumRoute, getAlbumContentsRoute, getUserAlbumsRoute, updateAlbumRoute } from './lib/albums/routes.js';
import { createContentRoute, deleteContentRoute, getContentRoute, updateContentRoute } from './lib/content/routes.js';
import { createUser, deleteUser, getUserById, updateUser } from './lib/users/functions.js';
import { z } from 'zod/mini';
import type { BlankEnv, BlankInput } from 'hono/types';

const app = new Hono();

const BASE_API: string = '/api';

const handleError = (context: Context<BlankEnv, string, BlankInput>, error: Error) => {
  if (error instanceof z.core.$ZodError) {
    context.status(400);
    return context.json({ error: 'Invalid data retrieved from database' });
  }

  context.status(500);
  return context.json({ error: 'Miscellaneous error: ' + error.message });
};

// Register the routes
// Auth
app.get(BASE_API + validateAuthRoute, (context) => {
  
});

app.post(BASE_API + refreshAuthRoute, (context) => {
  const email = context.req.param('email');
  const passwordHash = context.req.param('passwordHash');
});

// User
app.get(BASE_API + getUserRoute, (context) => {
  const userId = context.req.param('userId')!;

  getUserById(userId).then((user) => {
    if (user !== null) {
      return context.json(user);
    }

    context.status(404);
    return context.json({ error: 'User not found' });
  }).catch((error) => {
    return handleError(context, error);
  });
});

app.post(BASE_API + createUserRoute, (context) => {
  createUser(context.req.json()).then((user) => {
    return context.json(user);
  }).catch((error) => {
    return handleError(context, error);
  });
});

app.put(BASE_API + updateUserRoute, (context) => {
  const userId = context.req.param('userId')!;

  updateUser(userId, context.req.json()).then(() => {

  }).catch((error) => {
    return handleError(context, error);
  });
});

app.delete(BASE_API + deleteUserRoute, (context) => {
  const userId = context.req.param('userId')!;

  deleteUser(userId).then(() => {

  }).catch((error) => {
    return handleError(context, error);
  });
});

// Albums
app.get(BASE_API + getUserAlbumsRoute, (context) => {
  const userId = context.req.param('userId');
  const pageNumber = context.req.param('pageNumber');
  const pageSize = context.req.param('pageSize');
});

app.get(BASE_API + getAlbumContentsRoute, (context) => {
  const albumId = context.req.param('albumId');
  const pageNumber = context.req.param('pageNumber');
  const pageSize = context.req.param('pageSize');
});

app.post(BASE_API + createAlbumRoute, (context) => {
  const userId = context.req.param('userId');
});

app.put(BASE_API + updateAlbumRoute, (context) => {
  const albumId = context.req.param('albumId');
});

app.delete(BASE_API + deleteAlbumRoute, (context) => {
  const albumId = context.req.param('albumId');
});

// Content
app.get(BASE_API + getContentRoute, (context) => {
  const contentId = context.req.param('contentId');
});

app.post(BASE_API + createContentRoute, (context) => {
});

app.put(BASE_API + updateContentRoute, (context) => {
  const contentId = context.req.param('contentId');
});

app.delete(BASE_API + deleteContentRoute, (context) => {
  const contentId = context.req.param('contentId');
});

// Start the server
serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
});
