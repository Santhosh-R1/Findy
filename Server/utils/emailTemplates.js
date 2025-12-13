// src/utils/emailTemplates.js

const styles = {
    container: `
        font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
        max-width: 600px;
        margin: 0 auto;
        background-color: #ffffff;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        overflow: hidden;
    `,
    header: `
        background-color: #20c997;
        padding: 20px;
        text-align: center;
    `,
    headerText: `
        color: #ffffff;
        margin: 0;
        font-size: 24px;
        font-weight: bold;
        letter-spacing: 1px;
    `,
    body: `
        padding: 30px 20px;
        color: #333333;
        line-height: 1.6;
    `,
    imageContainer: `
        text-align: center;
        margin: 20px 0;
    `,
    image: `
        max-width: 100%;
        height: auto;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    `,
    buttonContainer: `
        text-align: center;
        margin-top: 30px;
    `,
    button: `
        background-color: #20c997;
        color: #ffffff;
        padding: 12px 25px;
        text-decoration: none;
        border-radius: 5px;
        font-weight: bold;
        display: inline-block;
    `,
    footer: `
        background-color: #f8f9fa;
        padding: 15px;
        text-align: center;
        font-size: 12px;
        color: #888888;
        border-top: 1px solid #e0e0e0;
    `
};

// --- 1. Password Reset Template ---
const getPasswordResetHTML = (name, resetURL, appName = "Findy") => {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset</title>
    </head>
    <body style="margin: 0; padding: 20px; font-family: Arial, sans-serif; background-color: #f4f4f4;">
        <div style="${styles.container}">
            <div style="background-color: #00466a; padding: 20px; text-align: center;">
                <h1 style="${styles.headerText}">${appName}</h1>
            </div>
            <div style="${styles.body}">
                <p>Hi <strong>${name}</strong>,</p>
                <p>We received a request to reset the password for your ${appName} account. Please click the button below to set a new password. This link is only valid for 10 minutes.</p>
                
                <div style="${styles.buttonContainer}">
                    <a href="${resetURL}" target="_blank" style="${styles.button.replace('#20c997', '#00466a')}">
                        Reset Your Password
                    </a>
                </div>
                
                <p style="margin-top: 20px; font-size: 14px; color: #555;">If you did not request a password reset, please ignore this email or contact support.</p>
                
                <p>Thanks,<br/>The ${appName} Team</p>
            </div>
            <div style="${styles.footer}">
                &copy; ${new Date().getFullYear()} ${appName}. All rights reserved.
            </div>
        </div>
    </body>
    </html>
    `;
};

// --- 2. Match Found Template (For Owner) ---
const getMatchFoundHTML = (ownerName, itemName, itemImage, reviewLink) => {
    const imageUrl = itemImage.startsWith('http') ? itemImage : `http://localhost:5001/${itemImage.replace(/\\/g, '/')}`;

    return `
    <!DOCTYPE html>
    <html>
    <body style="margin: 0; padding: 20px; background-color: #f4f4f4;">
        <div style="${styles.container}">
            <div style="${styles.header}">
                <h1 style="${styles.headerText}">FINDY MATCH ALERT</h1>
            </div>
            <div style="${styles.body}">
                <p>Hello <strong>${ownerName}</strong>,</p>
                <p>Great news! Our AI system has detected a potential match for your lost item: <strong>${itemName}</strong>.</p>
                
               
                
                <p>Please review the details to confirm if this item belongs to you.</p>
                
                <div style="${styles.buttonContainer}">
                    <a href="${reviewLink}" style="${styles.button}">Review Match Now</a>
                </div>
            </div>
            <div style="${styles.footer}">
                &copy; ${new Date().getFullYear()} Findy. Helping you find what matters.
            </div>
        </div>
    </body>
    </html>
    `;
};

// --- 3. Community Alert Template (Broadcast) ---
const getCommunityAlertHTML = (itemName, description, location, date, itemImage) => {
    const imageUrl = itemImage.startsWith('http') ? itemImage : `http://localhost:5001/${itemImage.replace(/\\/g, '/')}`;

    return `
    <!DOCTYPE html>
    <html>
    <body style="margin: 0; padding: 20px; background-color: #f4f4f4;">
        <div style="${styles.container}">
            <div style="${styles.header}">
                <h1 style="${styles.headerText}">⚠️ LOST ITEM ALERT</h1>
            </div>
            <div style="${styles.body}">
                <p>Hello Community,</p>
                <p>A user has just reported a <strong>${itemName}</strong> as lost. Please keep an eye out!</p>
                
                <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; border: 1px solid #ffeeba; color: #856404; font-size: 14px;">
                    <p style="margin: 5px 0;"><strong>📍 Location Lost:</strong> ${location}</p>
                    <p style="margin: 5px 0;"><strong>📅 Date Lost:</strong> ${new Date(date).toLocaleDateString()}</p>
                    <p style="margin: 5px 0;"><strong>📝 Description:</strong> ${description}</p>
                </div>

                <div style="${styles.imageContainer}">
                    <img src="${imageUrl}" alt="Lost Item" style="${styles.image}" />
                </div>
                
                <p>If you find this item, please report it on the Findy Portal immediately to help reunite it with its owner.</p>
            </div>
            <div style="${styles.footer}">
                &copy; ${new Date().getFullYear()} Findy Community Alert System.
            </div>
        </div>
    </body>
    </html>
    `;
};

module.exports = { 
    getPasswordResetHTML, 
    getMatchFoundHTML, 
    getCommunityAlertHTML 
};