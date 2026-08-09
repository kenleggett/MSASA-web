
export async function onRequestPost({ request, env }) {

  const body = await request.json();

  const {
    shooter_id,
    event_id,
    score,
    twelves
  } = body;


  if (!shooter_id || !event_id || !score) {
    return Response.json({
      ok:false,
      error:"Missing required fields"
    },{
      status:400
    });
  }


  await env.DB.prepare(
    `
    INSERT INTO scores
    (
      shooter_id,
      event_id,
      score,
      twelves
    )

    VALUES
    (?, ?, ?, ?)

    `
  )
  .bind(
    shooter_id,
    event_id,
    score,
    twelves || 0
  )
  .run();


  return Response.json({
    ok:true,
    message:"Score added successfully"
  });

}
