import dotenv from 'dotenv'

dotenv.config({ path: '.env' })

const { getPayload } = await import('payload')
const { default: config } = await import('./src/payload.config')

const targetEmail = process.env.RESET_TARGET_EMAIL ?? process.env.ADMIN_EMAIL
const newPassword = process.env.NEW_PASSWORD ?? 'p4ssw0rd'

;(async () => {
  const payload = await getPayload({ config })
  const users = await payload.find({
    collection: 'users',
    limit: 100,
    depth: 0,
    where: targetEmail
      ? {
          email: {
            equals: targetEmail,
          },
        }
      : undefined,
  })

  if (!users.docs.length) {
    console.error(`No user found${targetEmail ? ` for email ${targetEmail}` : ''}`)
    process.exit(1)
  }

  const target = users.docs[0]

  await payload.update({
    collection: 'users',
    id: target.id,
    data: { password: newPassword },
  })

  const loginResult = await payload.login({
    collection: 'users',
    data: { email: target.email, password: newPassword },
  })

  console.log(
    JSON.stringify(
      {
        email: target.email,
        id: target.id,
        loginSucceeded: !!loginResult.user,
        passwordSet: true,
      },
      null,
      2,
    ),
  )
})()
