import nodemailer from 'nodemailer';

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

interface WeeklySummaryData {
  userEmail: string;
  userName: string;
  releases: Array<{
    artistName: string;
    artistImage?: string | null;
    releaseName: string;
    releaseType: string;
    releaseDate: Date;
    imageUrl?: string | null;
    spotifyUrl?: string | null;
    trackCount?: number | null;
  }>;
  startDate: Date;
  endDate: Date;
  totalReleases: number;
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
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; background-color: #f4f4f4; }
          .container { max-width: 600px; margin: 0 auto; background-color: #fff; padding: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>${emoji} Nouvelle sortie de ${data.artistName} !</h2>
          ${data.imageUrl ? `<img src="${data.imageUrl}" alt="${data.releaseName}" style="max-width: 300px;">` : ''}
          <h3>${data.releaseName}</h3>
          <p>Type: ${data.releaseType}</p>
          <p>Date de sortie: ${data.releaseDate.toLocaleDateString()}</p>
          <a href="${data.spotifyUrl}" style="background-color: #1DB954; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Écouter sur Spotify</a>
          <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd;">
            <p style="font-size: 12px; color: #666;">
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

  // 🆕 À AJOUTER dans la classe EmailService (avant le export default)

  /**
   * 🆕 NOUVELLE MÉTHODE : Envoie un récapitulatif hebdomadaire
   */
  async sendWeeklySummaryEmail(data: WeeklySummaryData): Promise<boolean> {
    try {
      const formatDate = (date: Date) => {
        return date.toLocaleDateString('fr-FR', { 
          weekday: 'long', 
          day: 'numeric', 
          month: 'long' 
        });
      };

      const getReleaseTypeLabel = (type: string): string => {
        const labels: { [key: string]: string } = {
          'album': '💿 Album',
          'single': '🎵 Single',
          'ep': '🎶 EP',
          'compilation': '📀 Compilation'
        };
        return labels[type.toLowerCase()] || '🎵 Sortie';
      };

      const getReleaseTypeBadge = (type: string): string => {
        const badges: { [key: string]: string } = {
          'album': '#8B5CF6',
          'single': '#EC4899',
          'ep': '#10B981',
          'compilation': '#F59E0B'
        };
        return badges[type.toLowerCase()] || '#6B7280';
      };

      // Construction du HTML pour chaque sortie
      const releasesHtml = data.releases.map(release => `
        <tr>
          <td style="padding: 20px; border-bottom: 1px solid #f3f4f6;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td width="80" valign="top">
                  ${release.imageUrl ? `
                    <img src="${release.imageUrl}" alt="${release.releaseName}" 
                         style="width: 80px; height: 80px; border-radius: 8px; display: block;">
                  ` : `
                    <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                                border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-size: 24px;">
                      🎵
                    </div>
                  `}
                </td>
                <td style="padding-left: 16px;">
                  <div style="font-size: 18px; font-weight: 600; color: #111827; margin-bottom: 4px;">
                    ${release.releaseName}
                  </div>
                  <div style="font-size: 14px; color: #6b7280; margin-bottom: 8px;">
                    par ${release.artistName}
                  </div>
                  <div style="display: inline-block;">
                    <span style="background-color: ${getReleaseTypeBadge(release.releaseType)}; 
                                 color: white; padding: 4px 12px; border-radius: 12px; 
                                 font-size: 12px; font-weight: 500; display: inline-block;">
                      ${getReleaseTypeLabel(release.releaseType)}
                    </span>
                    <span style="color: #9ca3af; font-size: 12px; margin-left: 12px;">
                      📅 ${formatDate(release.releaseDate)}
                    </span>
                    ${release.trackCount ? `
                      <span style="color: #9ca3af; font-size: 12px; margin-left: 12px;">
                        🎼 ${release.trackCount} titre${release.trackCount > 1 ? 's' : ''}
                      </span>
                    ` : ''}
                  </div>
                  ${release.spotifyUrl ? `
                    <div style="margin-top: 12px;">
                      <a href="${release.spotifyUrl}" 
                         style="display: inline-block; background-color: #1DB954; color: white; 
                                padding: 8px 16px; border-radius: 20px; text-decoration: none; 
                                font-size: 13px; font-weight: 500;">
                        🎧 Écouter sur Spotify
                      </a>
                    </div>
                  ` : ''}
                </td>
              </tr>
            </table>
          </td>
        </tr>
      `).join('');

      const htmlContent = `
        <!DOCTYPE html>
        <html lang="fr">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Récapitulatif hebdomadaire - Music Tracker</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
                  
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                      <div style="font-size: 32px; margin-bottom: 8px;">🎵</div>
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                        Récapitulatif de la semaine
                      </h1>
                      <p style="margin: 12px 0 0 0; color: #e0e7ff; font-size: 16px;">
                        ${formatDate(data.startDate)} - ${formatDate(data.endDate)}
                      </p>
                    </td>
                  </tr>

                  <!-- Greeting -->
                  <tr>
                    <td style="padding: 30px 30px 20px 30px;">
                      <p style="margin: 0; font-size: 16px; color: #374151; line-height: 1.6;">
                        Bonjour <strong>${data.userName}</strong> ! 👋
                      </p>
                      <p style="margin: 16px 0 0 0; font-size: 16px; color: #374151; line-height: 1.6;">
                        Voici un récapitulatif de <strong style="color: #8B5CF6;">${data.totalReleases} sortie${data.totalReleases > 1 ? 's' : ''}</strong> 
                        de vos artistes favoris cette semaine :
                      </p>
                    </td>
                  </tr>

                  <!-- Releases List -->
                  <tr>
                    <td>
                      <table width="100%" cellpadding="0" cellspacing="0">
                        ${releasesHtml}
                      </table>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="padding: 30px; text-align: center; background-color: #f9fafb; border-top: 1px solid #e5e7eb;">
                      <p style="margin: 0 0 12px 0; font-size: 14px; color: #6b7280;">
                        Profitez de votre écoute ! 🎧
                      </p>
                      <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                        Vous recevez cet email car vous êtes inscrit(e) à Music Tracker.<br>
                        Pour gérer vos préférences de notification, connectez-vous à votre compte.
                      </p>
                    </td>
                  </tr>

                </table>

                <!-- Bottom spacing -->
                <div style="height: 40px;"></div>
                
                <!-- Footer text -->
                <p style="text-align: center; font-size: 12px; color: #9ca3af; margin: 0;">
                  © ${new Date().getFullYear()} Music Tracker - Tous droits réservés
                </p>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `;

      const textContent = `
Récapitulatif hebdomadaire - Music Tracker

Bonjour ${data.userName} !

Voici un récapitulatif de ${data.totalReleases} sortie(s) de vos artistes favoris cette semaine 
(${formatDate(data.startDate)} - ${formatDate(data.endDate)}) :

${data.releases.map((release, index) => `
${index + 1}. ${release.releaseName}
   Par : ${release.artistName}
   Type : ${getReleaseTypeLabel(release.releaseType)}
   Date : ${formatDate(release.releaseDate)}
   ${release.spotifyUrl ? `Lien Spotify : ${release.spotifyUrl}` : ''}
`).join('\n')}

Profitez de votre écoute ! 🎧

---
Music Tracker © ${new Date().getFullYear()}
      `.trim();

      const mailOptions = {
        from: `"Music Tracker" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
        to: data.userEmail,
        subject: `🎵 Récapitulatif : ${data.totalReleases} nouvelle${data.totalReleases > 1 ? 's' : ''} sortie${data.totalReleases > 1 ? 's' : ''} cette semaine !`,
        text: textContent,
        html: htmlContent,
      };

      if (!this.transporter) {
        throw new Error('Transporter is not initialized');
      }

      const info = await this.transporter.sendMail(mailOptions);
      console.log(`✅ Récapitulatif envoyé à ${data.userEmail} (ID: ${info.messageId})`);
      return true;

    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi du récapitulatif:', error);
      return false;
    }
  }
}

export default new EmailService();