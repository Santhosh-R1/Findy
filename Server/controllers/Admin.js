const jwt = require('jsonwebtoken');

const adminController = {};

adminController.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const ADMIN_EMAIL = "admin@123.com";
    const ADMIN_PASSWORD = "admin@123";

    if (!email || !password) {
      return res.status(400).json({ message: "Please provide email and password" });
    }

    const isEmailCorrect = email.toLowerCase() === ADMIN_EMAIL;
    const isPasswordCorrect = password === ADMIN_PASSWORD;

    if (isEmailCorrect && isPasswordCorrect) {
      const payload = {
        id: 'static_admin_id_001',
        email: ADMIN_EMAIL,
        role: 'admin'
      };

      const token = jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: '1d' } 
      );

      return res.status(200).json({
        message: "Admin logged in successfully",
        token: token,
        admin: {
          email: ADMIN_EMAIL,
          role: 'admin'
        }
      });

    } else {
      return res.status(401).json({ message: "Invalid credentials" });
    }

  } catch (error) {
    console.error("Admin login error:", error);
    return res.status(500).json({ message: "An internal server error occurred" });
  }
};

module.exports = adminController;