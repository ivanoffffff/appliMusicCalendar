import nodemailer from 'nodemailer';
import { Release } from '@prisma/client';

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

interface NotificationData {
  userEmail: string;
  userName: string;
  artistName: string;
  releaseName: string;
  releaseType: string;
  releaseDate: Date;
  spotifyUrl: string;
  imageUrl?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter | undefined;

  constructor() {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    const config: EmailConfig = {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
      },
    };

    this.transporter = nodemailer.createTransport(config);
  }

  async sendNewReleaseNotification(data: NotificationData): Promise<boolean> {
    try {
      const htmlContent = this.generateReleaseEmailTemplate(data);
      
      const mailOptions = {
        from: `"Music Tracker" <${process.env.SMTP_USER}>`,
        to: data.userEmail,
        subject: `🎵 Nouvelle sortie de ${data.artistName} !`,
        html: htmlContent,
      };

      if (!this.transporter) {
        throw new Error('Transporter is not initialized');
      }
      const result = await this.transporter.sendMail(mailOptions);
      console.log(`✅ Email envoyé avec succès à ${data.userEmail}:`, result.messageId);
      return true;
    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi de l\'email:', error);
      return false;
    }
  }

  private generateReleaseEmailTemplate(data: NotificationData): string {
    const releaseTypeEmoji = {
      'album': '💿',
      'single': '🎵',
      'compilation': '📀'
    };

    const emoji = releaseTypeEmoji[data.releaseType as keyof typeof releaseTypeEmoji] || '🎵';

    return `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Nouvelle sortie musicale</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px 20px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 300;
          }
          .content {
            padding: 30px 20px;
          }
          .release-card {
            background: #f8f9fa;
            border-radius: 12px;
            padding: 25px;
            margin: 20px 0;
            border-left: 4px solid #667eea;
          }
          .release-image {
            width: 120px;
            height: 120px;
            border-radius: 8px;
            object-fit: cover;
            float: left;
            margin-right: 20px;
            margin-bottom: 10px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
          }
          .release-info h2 {
            margin: 0 0 10px 0;
            color: #333;
            font-size: 24px;
          }
          .release-info p {
            margin: 5px 0;
            color: #666;
          }
          .release-type {
            display: inline-block;
            background: #667eea;
            color: white;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
            margin: 10px 0;
          }
          .cta-button {
            display: inline-block;
            background: #1db954;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 25px;
            font-weight: bold;
            margin: 20px 0;
            transition: background-color 0.3s;
          }
          .cta-button:hover {
            background: #1aa34a;
          }
          .footer {
            background: #f8f9fa;
            padding: 20px;
            text-align: center;
            color: #666;
            font-size: 14px;
          }
          .clearfix::after {
            content: "";
            display: table;
            clear: both;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${emoji} Nouvelle sortie musicale !</h1>
          </div>
          
          <div class="content">
            <p>Salut ${data.userName} !</p>
            <p>Bonne nouvelle ! <strong>${data.artistName}</strong>, l'un de tes artistes favoris, vient de sortir quelque chose de nouveau :</p>
            
            <div class="release-card clearfix">
              ${data.imageUrl ? `<img src="${data.imageUrl}" alt="${data.releaseName}" class="release-image" />` : ''}
              <div class="release-info">
                <h2>${data.releaseName}</h2>
                <p><strong>Artiste :</strong> ${data.artistName}</p>
                <p><strong>Date de sortie :</strong> ${new Date(data.releaseDate).toLocaleDateString('fr-FR')}</p>
                <span class="release-type">${data.releaseType}</span>
              </div>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.spotifyUrl}" class="cta-button" target="_blank">
                🎧 Écouter sur Spotify
              </a>
            </div>
            
            <p>N'hésite pas à découvrir cette nouvelle sortie et à la partager avec tes amis !</p>
          </div>
          
          <div class="footer">
            <p>Music Tracker - Ton assistant pour suivre tes artistes favoris</p>
            <p style="font-size: 12px; color: #999;">
              Tu ne veux plus recevoir ces notifications ? 
              <a href="#" style="color: #667eea;">Se désabonner</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  async testConnection(): Promise<boolean> {
    try {
      if (!this.transporter) {
        throw new Error('Transporter is not initialized');
      }
      await this.transporter.verify();
      console.log('✅ Connexion SMTP vérifiée avec succès');
      return true;
    } catch (error) {
      console.error('❌ Erreur de connexion SMTP:', error);
      return false;
    }
  }
}

export default new EmailService();