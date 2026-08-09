export async function onRequestPost({ request, env }) {

  try {

    const body = await request.json();

    const { email, password } = body;

    if (!email || !password) {
      return Response.json(
        {
          success: false,
          message: "Email and password are required"
        },
        { status: 400 }
      );
    }

    // Hash the supplied password using the same method
    // currently used by create-user.js
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
      .map(b => b.toString(16).padStart(2, "0"))
      .join("");

    const user = await env.DB.prepare(
      `
      SELECT
        id,
        name,
        email,
        password_hash,
        role,
        active,
        assigned_event_id
      FROM users
      WHERE email = ?
      LIMIT 1
      `
    )
      .bind(email.trim().toLowerCase())
      .first();

    if (!user) {
      return Response.json(
        {
          success: false,
          message: "Invalid email or password"
        },
        { status: 401 }
      );
    }

    if (!user.active) {
      return Response.json(
        {
          success: false,
          message: "This account is inactive"
        },
        { status: 403 }
      );
    }

    if (user.password_hash !== password_hash) {
      return Response.json(
        {
          success: false,
          message: "Invalid email or password"
        },
        { status: 401 }
      );
    }

    await env.DB.prepare(
      `
      UPDATE users
      SET
        last_login = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
      `
    )
      .bind(user.id)
      .run();

    return Response.json({
      success: true,
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        assigned_event_id: user.assigned_event_id
      }
    });

  } catch (error) {

    console.error("Login error:", error);

    return Response.json(
      {
        success: false,
        message: "Login failed"
      },
      { status: 500 }
    );
  }
}
