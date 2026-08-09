export async function onRequestPost(context) {

  const { request, env } = context;

  const body = await request.json();

  const {
    name,
    email,
    password,
    role,
    assigned_event_id
  } = body;


  if (!name || !email || !password) {

    return Response.json({
      success:false,
      message:"Missing required fields"
    });

  }


  // Hash password

  const encoder = new TextEncoder();

  const data = encoder.encode(password);

  const hashBuffer = await crypto.subtle.digest(
    "SHA-256",
    data
  );

  const hashArray = Array.from(
    new Uint8Array(hashBuffer)
  );

  const password_hash = hashArray
    .map(b => b.toString(16).padStart(2,"0"))
    .join("");



  await env.DB.prepare(

`
INSERT INTO users
(
name,
email,
password_hash,
role,
assigned_event_id
)

VALUES
(?,?,?,?,?)
`

)

.bind(

name,
email,
password_hash,
role || "event_host",
assigned_event_id || null

)

.run();



return Response.json({

success:true,

message:"User created"

});


}
