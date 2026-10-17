import transporter from "../config/mail.js";

export const sendOtpEmail = async ({
    email,
    name,
    otp,
    purpose,
}) => {

    let subject = "";
    let heading = "";
    let description = "";


    if (purpose === "email-verification") {

        subject =
            "Verify your Khata account";

        heading =
            "Verify your email";

        description =
            "Use the OTP below to verify your email address and activate your Khata account.";

    }


    if (purpose === "password-reset") {

        subject =
            "Reset your Khata password";

        heading =
            "Reset your password";

        description =
            "Use the OTP below to verify your request and reset your Khata account password.";

    }


    await transporter.sendMail({

        from:
            `"Khata App" <${process.env.EMAIL_USER}>`,

        to: email,

        subject,

        html: `

        <!DOCTYPE html>

        <html>

        <body
            style="
                margin:0;
                padding:0;
                background:#f5f7f5;
                font-family:Arial,sans-serif;
            "
        >

            <div
                style="
                    max-width:600px;
                    margin:40px auto;
                    background:white;
                    padding:35px;
                    border-radius:16px;
                "
            >

                <h2
                    style="
                        color:#1B5E20;
                        margin-bottom:20px;
                    "
                >
                    Khata
                </h2>


                <h3>
                    ${heading}
                </h3>


                <p>
                    Hi ${name},
                </p>


                <p>
                    ${description}
                </p>


                <div
                    style="
                        margin:30px 0;
                        padding:20px;
                        background:#f1f8f1;
                        border-radius:12px;
                        text-align:center;
                    "
                >

                    <p
                        style="
                            margin:0 0 10px 0;
                            color:#666;
                        "
                    >
                        Your OTP
                    </p>


                    <strong
                        style="
                            font-size:32px;
                            letter-spacing:8px;
                            color:#2E7D32;
                        "
                    >
                        ${otp}
                    </strong>

                </div>


                <p>
                    This OTP will expire in
                    <strong>10 minutes</strong>.
                </p>


                <p
                    style="
                        color:#777;
                        font-size:13px;
                    "
                >
                    If you did not request this,
                    you can safely ignore this email.
                </p>


                <hr
                    style="
                        border:none;
                        border-top:1px solid #eee;
                        margin:30px 0;
                    "
                />


                <p
                    style="
                        color:#999;
                        font-size:12px;
                    "
                >
                    This is an automated email
                    from Khata. Please do not reply.
                </p>

            </div>

        </body>

        </html>
        `,
    });
};