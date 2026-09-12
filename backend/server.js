require("dotenv").config();

const express = require("express");
const cors = require("cors");
const db = require("./db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

const app = express();
async function createEtherealTransporter() {
  const testAccount = await nodemailer.createTestAccount();

  return nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass
    }
  });
}

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

app.use(cors());
app.use(express.json());


// ==============================
// CREATE RAZORPAY PAYMENT ORDER
// ==============================

app.post("/api/payment/create-order", async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount) {
      return res.status(400).json({
        message: "Amount is required"
      });
    }

    const options = {
      amount: Math.round(Number(amount) * 100),
      currency: "INR",
      receipt: `receipt_${Date.now()}`
    };

    const order = await razorpay.orders.create(options);

    res.status(200).json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    console.log("Razorpay order error:", error);

    res.status(500).json({
      message: "Unable to create payment order"
    });
  }
});


// ==============================
// VERIFY RAZORPAY PAYMENT
// ==============================

app.post("/api/payment/verify", (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      user_id,
      total_amount,
      shipping_address,
      payment_method
    } = req.body;

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !user_id ||
      !total_amount ||
      !shipping_address ||
      !payment_method
    ) {
      return res.status(400).json({
        message: "Required payment details are missing"
      });
    }

    const generated_signature = crypto
      .createHmac(
        "sha256",
        process.env.RAZORPAY_KEY_SECRET
      )
      .update(
        `${razorpay_order_id}|${razorpay_payment_id}`
      )
      .digest("hex");

    if (generated_signature !== razorpay_signature) {
      return res.status(400).json({
        message: "Payment verification failed"
      });
    }

    const sql = `
      INSERT INTO orders
      (
        user_id,
        total_amount,
        status,
        order_date,
        shipping_address,
        payment_status
      )
      VALUES (?, ?, ?, NOW(), ?, ?)
    `;

    db.query(
      sql,
      [
        user_id,
        total_amount,
        "Pending",
        shipping_address,
        "Paid"
      ],
      (error, result) => {
        if (error) {
          console.log("Order creation error:", error);

          return res.status(500).json({
            message: "Unable to create order"
          });
        }

        const deleteCartSql = `
          DELETE FROM cart
          WHERE user_id = ?
        `;

        db.query(
          deleteCartSql,
          [user_id],
          (cartError) => {
            if (cartError) {
              console.log(
                "Cart clearing error:",
                cartError
              );

              return res.status(500).json({
                message:
                  "Order created but cart could not be cleared"
              });
            }

            res.status(200).json({
              message:
                "Payment verified and order created",
              orderId: result.insertId,
              paymentStatus: "Paid"
            });
          }
        );
      }
    );
  } catch (error) {
    console.log(
      "Payment verification error:",
      error
    );

    res.status(500).json({
      message: "Payment verification failed"
    });
  }
});


// ==============================
// ROOT API
// ==============================

app.get("/", (req, res) => {
  res.send("E-commerce Backend Server is Running");
});


// ==============================
// PRODUCTS API
// ==============================

app.get("/products", (req, res) => {
  db.query(
    "SELECT * FROM products",
    (err, results) => {
      if (err) {
        return res.status(500).json({
          error: err.message
        });
      }

      res.json(results);
    }
  );
});

app.get("/api/products", (req, res) => {
  db.query(
    "SELECT * FROM products",
    (err, results) => {
      if (err) {
        return res.status(500).json({
          error: err.message
        });
      }

      res.status(200).json(results);
    }
  );
});


// ==============================
// REGISTER API
// ==============================

app.post(
  "/api/auth/register",
  async (req, res) => {
    const {
      name,
      email,
      password
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    db.query(
      "SELECT * FROM users WHERE email = ?",
      [email],
      async (err, results) => {
        if (err) {
          return res.status(500).json({
            error: err.message
          });
        }

        if (results.length > 0) {
          return res.status(400).json({
            message: "Email already exists"
          });
        }

        const hashpassword =
          await bcrypt.hash(password, 10);

        db.query(
          `INSERT INTO users
           (name, email, password)
           VALUES (?, ?, ?)`,
          [
            name,
            email,
            hashpassword
          ],
          (err, result) => {
            if (err) {
              return res.status(500).json({
                error: err.message
              });
            }

            res.status(201).json({
              message:
                "User registered successfully"
            });
          }
        );
      }
    );
  }
);


// ==============================
// LOGIN API
// ==============================

app.post(
  "/api/auth/login",
  async (req, res) => {
    const {
      email,
      password
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message:
          "Email and password are required"
      });
    }

    db.query(
      "SELECT * FROM users WHERE email = ?",
      [email],
      async (err, results) => {
        if (err) {
          return res.status(500).json({
            error: err.message
          });
        }

        if (results.length === 0) {
          return res.status(401).json({
            message:
              "Invalid email or password"
          });
        }

        const user = results[0];

        const isPasswordValid =
          await bcrypt.compare(
            password,
            user.password
          );

        if (!isPasswordValid) {
          return res.status(401).json({
            message:
              "Invalid email or password"
          });
        }

        const token = jwt.sign(
          {
            id: user.id,
            email: user.email
          },
          process.env.JWT_SECRET,
          {
            expiresIn:
              process.env.JWT_EXPIRES_IN
          }
        );

        res.status(200).json({
          message: "Login successful",
          token: token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email
          }
        });
      }
    );
  }
);
// ==============================
// FORGOT PASSWORD API
// ==============================

app.post("/api/auth/forgot-password", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      message: "Email is required"
    });
  }

  const resetToken = crypto.randomBytes(32).toString("hex");
  const expiry = new Date(Date.now() + 15 * 60 * 1000);

  const sql = `
    UPDATE users
    SET reset_token = ?, reset_token_expiry = ?
    WHERE email = ?
  `;

  db.query(
    sql,
    [resetToken, expiry, email],
    async (err, result) => {
      if (err) {
        console.log("Forgot password error:", err);
        return res.status(500).json({
          message: "Something went wrong"
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          message: "Email not found"
        });
      }

      try {
        const transporter = await createEtherealTransporter();

        const resetLink =
          `http://localhost:5173/reset-password?token=${resetToken}`;

        const info = await transporter.sendMail({
          from: '"Ecommerce App" <no-reply@ecommerce.test>',
          to: email,
          subject: "Reset Your Password",
          html: `
            <h2>Password Reset</h2>
            <p>Click the button below to reset your password.</p>

            <a href="${resetLink}"
              style="
                display:inline-block;
                padding:10px 20px;
                background:#2563eb;
                color:white;
                text-decoration:none;
                border-radius:6px;
              ">
              Reset Password
            </a>

            <p>This link expires in 15 minutes.</p>
          `
        });

        console.log(
          "Preview URL:",
          nodemailer.getTestMessageUrl(info)
        );

        res.status(200).json({
          message: "Password reset link sent to your email"
        });

      } catch (emailError) {
        console.log("Email sending error:", emailError);

        res.status(500).json({
          message: "Unable to send reset email"
        });
      }
    }
  );
});
// ==============================
// RESET PASSWORD API
// ==============================

app.post("/api/auth/reset-password", async (req, res) => {
  const {
    resetToken,
    newPassword
  } = req.body;

  if (!resetToken || !newPassword) {
    return res.status(400).json({
      message: "Reset token and new password are required"
    });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({
      message: "Password must be at least 6 characters"
    });
  }

  const sql = `
    SELECT id
    FROM users
    WHERE reset_token = ?
    AND reset_token_expiry > NOW()
  `;

  db.query(
    sql,
    [resetToken],
    async (err, results) => {
      if (err) {
        console.log("Reset password error:", err);

        return res.status(500).json({
          message: "Something went wrong"
        });
      }

      if (results.length === 0) {
        return res.status(400).json({
          message: "Invalid or expired reset token"
        });
      }

      const hashedPassword = await bcrypt.hash(
        newPassword,
        10
      );

      const updateSql = `
        UPDATE users
        SET password = ?,
            reset_token = NULL,
            reset_token_expiry = NULL
        WHERE id = ?
      `;

      db.query(
        updateSql,
        [hashedPassword, results[0].id],
        (updateErr) => {
          if (updateErr) {
            console.log(
              "Password update error:",
              updateErr
            );

            return res.status(500).json({
              message: "Unable to reset password"
            });
          }

          res.status(200).json({
            message: "Password reset successfully"
          });
        }
      );
    }
  );
});


// ==============================
// ADD PRODUCT TO CART
// ==============================

app.post("/api/cart", (req, res) => {
  console.log(
    "CART API HIT SUCCESSFULL"
  );

  const {
    user_id,
    product_id,
    quantity
  } = req.body;

  if (
    !user_id ||
    !product_id ||
    !quantity
  ) {
    return res.status(400).json({
      message:
        "user_id, product_id and quantity are required"
    });
  }

  const checkSql = `
    SELECT * FROM cart
    WHERE user_id = ? AND product_id = ?
  `;

  db.query(
    checkSql,
    [user_id, product_id],
    (err, results) => {
      if (err) {
        return res.status(500).json({
          error: err.message
        });
      }

      if (results.length > 0) {
        const existingQuantity =
          Number(results[0].quantity);

        const newQuantity =
          existingQuantity +
          Number(quantity);

        const updateSql = `
          UPDATE cart
          SET quantity = ?
          WHERE user_id = ? AND product_id = ?
        `;

        db.query(
          updateSql,
          [
            newQuantity,
            user_id,
            product_id
          ],
          (err) => {
            if (err) {
              return res.status(500).json({
                error: err.message
              });
            }

            return res.status(200).json({
              message:
                "Cart quantity updated",
              quantity: newQuantity
            });
          }
        );

        return;
      }

      const insertSql = `
        INSERT INTO cart
        (user_id, product_id, quantity)
        VALUES (?, ?, ?)
      `;

      db.query(
        insertSql,
        [
          user_id,
          product_id,
          quantity
        ],
        (err, result) => {
          if (err) {
            return res.status(500).json({
              error: err.message
            });
          }

          res.status(201).json({
            message:
              "Product added to cart",
            cartId: result.insertId,
            quantity:
              Number(quantity)
          });
        }
      );
    }
  );
});


// ==============================
// GET CART ITEMS
// ==============================

app.get(
  "/api/cart/:userId",
  (req, res) => {
    const { userId } = req.params;

    const sql = `
      SELECT
        cart.id,
        cart.user_id,
        cart.product_id,
        cart.quantity,
        products.name,
        products.price,
        products.description,
        products.image_url
      FROM cart
      JOIN products
        ON cart.product_id = products.id
      WHERE cart.user_id = ?
      ORDER BY cart.id DESC
    `;

    db.query(
      sql,
      [userId],
      (err, results) => {
        if (err) {
          return res.status(500).json({
            error: err.message
          });
        }

        res.status(200).json(
          results
        );
      }
    );
  }
);


// ==============================
// UPDATE CART QUANTITY
// ==============================

app.put(
  "/api/cart/:userId/:productId",
  (req, res) => {
    const {
      userId,
      productId
    } = req.params;

    const {
      quantity
    } = req.body;

    const newQuantity =
      Number(quantity);

    if (isNaN(newQuantity)) {
      return res.status(400).json({
        message:
          "Quantity must be a number"
      });
    }

    if (newQuantity <= 0) {
      const deleteSql = `
        DELETE FROM cart
        WHERE user_id = ? AND product_id = ?
      `;

      return db.query(
        deleteSql,
        [userId, productId],
        (err) => {
          if (err) {
            return res.status(500).json({
              error: err.message
            });
          }

          res.status(200).json({
            message:
              "Product removed from cart"
          });
        }
      );
    }

    const sql = `
      UPDATE cart
      SET quantity = ?
      WHERE user_id = ? AND product_id = ?
    `;

    db.query(
      sql,
      [
        newQuantity,
        userId,
        productId
      ],
      (err, result) => {
        if (err) {
          return res.status(500).json({
            error: err.message
          });
        }

        if (
          result.affectedRows === 0
        ) {
          return res.status(404).json({
            message:
              "Cart product not found"
          });
        }

        res.status(200).json({
          message:
            "Cart quantity updated",
          quantity: newQuantity
        });
      }
    );
  }
);


// ==============================
// REMOVE PRODUCT FROM CART
// ==============================

app.delete(
  "/api/cart/:userId/:productId",
  (req, res) => {
    const {
      userId,
      productId
    } = req.params;

    const sql = `
      DELETE FROM cart
      WHERE user_id = ? AND product_id = ?
    `;

    db.query(
      sql,
      [userId, productId],
      (err, result) => {
        if (err) {
          return res.status(500).json({
            error: err.message
          });
        }

        res.status(200).json({
          message:
            "Product removed from cart"
        });
      }
    );
  }
);


// ==============================
// PLACE ORDER API
// ==============================

app.post(
  "/api/orders",
  (req, res) => {
    const {
      user_id,
      total_amount,
      shipping_address,
      payment_method
    } = req.body;

    if (
      !user_id ||
      !total_amount ||
      !shipping_address
    ) {
      return res.status(400).json({
        message:
          "user_id, total_amount and shipping_address are required"
      });
    }

    const payment_status =
      payment_method ===
      "Cash on Delivery"
        ? "Pending"
        : "Paid";

    const sql = `
      INSERT INTO orders
      (
        user_id,
        total_amount,
        status,
        order_date,
        shipping_address,
        payment_status
      )
      VALUES (?, ?, ?, NOW(), ?, ?)
    `;

    db.query(
      sql,
      [
        user_id,
        total_amount,
        "Pending",
        shipping_address,
        payment_status
      ],
      (err, result) => {
        if (err) {
          return res.status(500).json({
            error: err.message
          });
        }

        const deleteCartSql = `
          DELETE FROM cart
          WHERE user_id = ?
        `;

        db.query(
          deleteCartSql,
          [user_id],
          (deleteErr) => {
            if (deleteErr) {
              return res.status(500).json({
                error:
                  deleteErr.message
              });
            }

            res.status(201).json({
              message:
                "Order placed successfully",
              orderId:
                result.insertId,
              paymentStatus:
                payment_status
            });
          }
        );
      }
    );
  }
);


// ==============================
// GET USER'S ORDERS
// ==============================

app.get(
  "/api/orders/:userId",
  (req, res) => {
    const { userId } = req.params;

    const sql = `
      SELECT *
      FROM orders
      WHERE user_id = ?
      ORDER BY order_date DESC
    `;

    db.query(
      sql,
      [userId],
      (err, results) => {
        if (err) {
          return res.status(500).json({
            error: err.message
          });
        }

        res.status(200).json(
          results
        );
      }
    );
  }
);


// ==============================
// CANCEL USER'S ORDER
// ==============================

app.put(
  "/api/orders/:userId/:orderId/cancel",
  (req, res) => {
    const {
      userId,
      orderId
    } = req.params;

    const sql = `
      UPDATE orders
      SET status = ?
      WHERE id = ?
      AND user_id = ?
      AND status = ?
    `;

    db.query(
      sql,
      [
        "Cancelled",
        orderId,
        userId,
        "Pending"
      ],
      (err, result) => {
        if (err) {
          return res.status(500).json({
            error: err.message
          });
        }

        if (
          result.affectedRows === 0
        ) {
          return res.status(400).json({
            message:
              "Order cannot be cancelled"
          });
        }

        res.status(200).json({
          message:
            "Order cancelled successfully"
        });
      }
    );
  }
);


// ==============================
// GET USER PROFILE
// ==============================

app.get(
  "/api/profile/:userId",
  (req, res) => {
    const { userId } = req.params;

    const sql = `
      SELECT
        id,
        name,
        email,
        phone,
        address
      FROM users
      WHERE id = ?
    `;

    db.query(
      sql,
      [userId],
      (err, results) => {
        if (err) {
          return res.status(500).json({
            error: err.message
          });
        }

        if (
          results.length === 0
        ) {
          return res.status(404).json({
            message:
              "User not found"
          });
        }

        res.status(200).json(
          results[0]
        );
      }
    );
  }
);


// ==============================
// UPDATE USER PROFILE
// ==============================

app.put(
  "/api/profile/:userId",
  (req, res) => {
    const { userId } = req.params;

    const {
      name,
      email,
      phone,
      address
    } = req.body;

    const sql = `
      UPDATE users
      SET
        name = ?,
        email = ?,
        phone = ?,
        address = ?
      WHERE id = ?
    `;

    db.query(
      sql,
      [
        name,
        email,
        phone,
        address,
        userId
      ],
      (err, result) => {
        if (err) {
          return res.status(500).json({
            error: err.message
          });
        }

        res.status(200).json({
          message:
            "Profile updated successfully"
        });
      }
    );
  }
);


// ==============================
// START SERVER
// ==============================

const PORT = 5000;

app.listen(PORT, () => {
  console.log(
    `Server running on port ${PORT}`
  );
});