import axios from 'axios';

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
  private sendgridApiKey: string;
  private fromEmail: string;
  private fromName: string;

  constructor() {
    this.sendgridApiKey = process.env.SENDGRID_API_KEY || '';
    this.fromEmail = process.env.SMTP_FROM_EMAIL || '';
    this.fromName = 'Music Tracker';
    
    if (!this.sendgridApiKey) {
      console.warn('⚠️ SENDGRID_API_KEY non configurée, les emails ne seront pas envoyés');
    } else if (!this.fromEmail) {
      console.warn('⚠️ SMTP_FROM_EMAIL non configurée, les emails ne seront pas envoyés');
    } else {
      console.log(`✅ Service email SendGrid initialisé (from: ${this.fromEmail})`);
    }
  }

  async sendNewReleaseNotification(data: NotificationData): Promise<boolean> {
    try {
      if (!this.sendgridApiKey || !this.fromEmail) {
        console.error('❌ Configuration SendGrid manquante');
        return false;
      }

      const htmlContent = this.generateReleaseEmailTemplate(data);
      
      const response = await axios.post(
        'https://api.sendgrid.com/v3/mail/send',
        {
          personalizations: [{
            to: [{ email: data.userEmail }],
            subject: `🎵 Nouvelle sortie de ${data.artistName} !`
          }],
          from: {
            email: this.fromEmail,
            name: this.fromName
          },
          content: [{
            type: 'text/html',
            value: htmlContent
          }]
        },
        {
          headers: {
            'Authorization': `Bearer ${this.sendgridApiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log(`✅ Email envoyé avec succès à ${data.userEmail} via SendGrid`);
      return true;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('❌ Erreur SendGrid API:', error.response?.data || error.message);
      } else {
        console.error('❌ Erreur lors de l\'envoi de l\'email:', error);
      }
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
          body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 20px auto; background-color: #fff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          h2 { color: #1DB954; margin-bottom: 20px; }
          .release-image { max-width: 300px; border-radius: 8px; margin: 20px 0; }
          .info { margin: 15px 0; color: #333; }
          .spotify-btn { display: inline-block; background-color: #1DB954; color: white; padding: 12px 24px; text-decoration: none; border-radius: 25px; margin-top: 20px; font-weight: bold; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>${emoji} Nouvelle sortie de ${data.artistName} !</h2>
          <p>Bonjour ${data.userName},</p>
          <p>Bonne nouvelle ! ${data.artistName} vient de sortir un nouveau ${data.releaseType} :</p>
          ${data.imageUrl ? `<img src="${data.imageUrl}" alt="${data.releaseName}" class="release-image">` : ''}
          <div class="info">
            <strong>Titre :</strong> ${data.releaseName}<br>
            <strong>Type :</strong> ${data.releaseType}<br>
            <strong>Date de sortie :</strong> ${data.releaseDate.toLocaleDateString('fr-FR')}
          </div>
          <a href="${data.spotifyUrl}" class="spotify-btn">🎧 Écouter sur Spotify</a>
          <div class="footer">
            <p>Vous recevez cet email car vous suivez ${data.artistName} sur Music Tracker.</p>
            <p>© ${new Date().getFullYear()} Music Tracker</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  async sendWeeklySummaryEmail(data: WeeklySummaryData): Promise<boolean> {
    try {
      if (!this.sendgridApiKey || !this.fromEmail) {
        console.error('❌ Configuration SendGrid manquante');
        return false;
      }

      const htmlContent = this.generateWeeklySummaryTemplate(data);
      
      const response = await axios.post(
        'https://api.sendgrid.com/v3/mail/send',
        {
          personalizations: [{
            to: [{ email: data.userEmail }],
            subject: `🎵 Récapitulatif : ${data.totalReleases} nouvelle${data.totalReleases > 1 ? 's' : ''} sortie${data.totalReleases > 1 ? 's' : ''} cette semaine !`
          }],
          from: {
            email: this.fromEmail,
            name: this.fromName
          },
          content: [{
            type: 'text/html',
            value: htmlContent
          }]
        },
        {
          headers: {
            'Authorization': `Bearer ${this.sendgridApiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log(`✅ Récapitulatif envoyé à ${data.userEmail} via SendGrid`);
      return true;

    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('❌ Erreur SendGrid API:', error.response?.data || error.message);
      } else {
        console.error('❌ Erreur lors de l\'envoi du récapitulatif:', error);
      }
      return false;
    }
  }

  private generateWeeklySummaryTemplate(data: WeeklySummaryData): string {
    const releasesHtml = data.releases.map(release => {
      const emoji = release.releaseType === 'album' ? '💿' : release.releaseType === 'single' ? '🎵' : '📀';
      return `
        <div style="padding: 15px; border-bottom: 1px solid #f3f4f6; margin-bottom: 15px;">
          ${release.imageUrl ? `<img src="${release.imageUrl}" style="width: 80px; height: 80px; border-radius: 4px; float: left; margin-right: 15px;">` : ''}
          <div>
            <strong>${emoji} ${release.releaseName}</strong><br>
            <span style="color: #666;">${release.artistName}</span><br>
            <span style="font-size: 12px; color: #999;">${new Date(release.releaseDate).toLocaleDateString('fr-FR')}</span><br>
            ${release.spotifyUrl ? `<a href="${release.spotifyUrl}" style="color: #1DB954; font-size: 12px;">Écouter sur Spotify</a>` : ''}
          </div>
          <div style="clear: both;"></div>
        </div>
      `;
    }).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 20px auto; background-color: #fff; padding: 30px; border-radius: 8px; }
          h2 { color: #1DB954; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>🎵 Votre récapitulatif musical hebdomadaire</h2>
          <p>Bonjour ${data.userName},</p>
          <p>Voici les ${data.totalReleases} nouvelle${data.totalReleases > 1 ? 's' : ''} sortie${data.totalReleases > 1 ? 's' : ''} de vos artistes favoris cette semaine :</p>
          ${releasesHtml}
          <p style="margin-top: 30px;">Bonne écoute ! 🎧</p>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666;">
            <p>© ${new Date().getFullYear()} Music Tracker</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  async testConnection(): Promise<boolean> {
    try {
      if (!this.sendgridApiKey) {
        console.error('❌ SENDGRID_API_KEY non configurée');
        return false;
      }

      // Test simple avec l'API SendGrid
      const response = await axios.get('https://api.sendgrid.com/v3/user/profile', {
        headers: {
          'Authorization': `Bearer ${this.sendgridApiKey}`,
        },
      });

      console.log('✅ Connexion SendGrid API vérifiée avec succès');
      return true;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('❌ Erreur SendGrid API:', error.response?.data || error.message);
      } else {
        console.error('❌ Erreur de connexion SendGrid:', error);
      }
      return false;
    }
  }
}

export default new EmailService();