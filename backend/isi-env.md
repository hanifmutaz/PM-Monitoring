Server (production)	Laptop pribadi / kantor (dev)
NODE_ENV    
Server (production)	production
	development

DATABASE_URL
Server (production)	connection string ke Postgres beneran di server	
    Postgres lokal di laptop (localhost:5432), atau tunnel/forward ke DB server kalau mau pake data asli

CONMAS_DB_*
Server (production)	isi kredensial ConMas asli (read-only)
	kosongin aja — sync job otomatis di-skip, gak bikin app crash (udah didesain gitu, liat komentar di env.js)

JWT_SECRET
Server (production)	random string panjang, generate sekali, jangan pernah ganti-ganti selama masih ada user yang lagi login (ganti = semua orang ke-logout paksa)
	boleh beda dari server punya, gak masalah — cuma DEV token doang

CORS_ORIGIN 
Server (production)	domain/IP asli tempat frontend production di-hosting
	http://localhost:5173

SMTP_*
Server (production)	isi kredensial SMTP asli
	kosongin — biar pas testing gak nyasar kirim email beneran ke orang

ADMIN_DEFAULT_*
Server (production)	cuma kepake sekali doang pas migration pertama kali jalan
	sama, cuma kepake sekali doang