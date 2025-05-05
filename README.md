# Smart Calendar App

## Setup
1. Clone repo
2. `composer install`
3. Create `.env` file
4. Import database schema

## Environment Variables
- SUPABASE_URL
- SUPABASE_KEY
- SMTP_CREDENTIALS

## Development
```bash
php -S localhost:8000 -t frontend

Deployment
[Add your deployment instructions]


### 13. **Security Considerations**
1. Add HTTPS configuration
2. Implement CSRF protection
3. Add rate limiting
4. Set up input validation
5. Regular dependency updates

### 14. **Maintenance**
1. Set up monitoring (Uptime Robot)
2. Regular backups (Supabase daily backups)
3. Update dependencies:
   ```bash
   composer update
   npm update
   ```