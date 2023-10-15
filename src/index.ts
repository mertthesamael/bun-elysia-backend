import { Elysia, t } from "elysia";
import { BooksDatabase } from "./db";
import { cookie } from '@elysiajs/cookie'
import { jwt } from '@elysiajs/jwt'
import { swagger } from '@elysiajs/swagger'

const app = new Elysia().use(swagger()).onError(({ code, error }) => {

  let status: number | undefined;

  switch (code) {
    case 'VALIDATION':
      status = 400;
      break;
    case 'NOT_FOUND':
      status = 404
      break
    default:
      status = 500
      break;
  }

  return new Response(error.toString(), { status: status })
}).use(cookie()).use(jwt({
  name: 'jwt',
  secret: 'supersecret'
})).decorate('db', new BooksDatabase());



app.get('/books', ({ db }) => db.getBooks())
app.post('/books', ({ db, body }) => db.addBook(body), {
  //Define type for body parameter
  body: t.Object({
    name: t.String(),
    author: t.String()
  })
})

app.put('/books', ({ db, body }) => db.updateBook(body.id, { name: body.name, author: body.author }), {
  body: t.Object({
    id: t.Number(),
    name: t.String(),
    author: t.String()
  })
})


app.get('/books/:id', async ({ db, params, jwt, cookie: { auth } }) => {

  const profile = await jwt.verify(auth)

  if (!profile) throw new Error("Unauthorized");

})
app.delete('/books/:id', ({ db, params }) => db.getBook(Number(params.id)))

app.listen(8000)

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
