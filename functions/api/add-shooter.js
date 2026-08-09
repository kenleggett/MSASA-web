export async function onRequestPost({ request, env }) {

  const body = await request.json();

  const {
    name,
    asa_number,
    class_name
  } = body;


  if (!name || !class_name) {
    return Response.json({
      ok: false,
      error: "Name and class are required"
    }, { status: 400 });
  }


  await env.DB.prepare(
    `
    INSERT INTO shooters
    (
      name,
      asa_number,
      class_name,
      active
    )
    VALUES
    (?, ?, ?, 1)
    `
  )
  .bind(
    name,
    asa_number || "",
    class_name
  )
  .run();


  return Response.json({
    ok: true,
    message: "Shooter added successfully"
  });

}
