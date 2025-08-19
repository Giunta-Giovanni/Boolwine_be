# Cantine Booleane Backend

Backend del progetto Cantine Booleane, un’applicazione e-commerce dedicata alla vendita di vini online.
Il backend è sviluppato con Node.js, Express.js, MySQL e integra Stripe per i pagamenti online.

# Tech Stack

    •	Node.js + Express.js → server e API REST
    •	MySQL → database relazionale
    •	Stripe API → gestione pagamenti online
    •	Nodemailer → invio email di conferma ordini
    •	CORS & Middleware personalizzati → sicurezza e gestione richieste
    •	.env → gestione variabili ambiente

# Struttura principale

├── data/ # Comunicazione con il DB
├── controllers/ # Logica delle rotte (ordini e prodotti)
├── routes/ # API endpoints
├── middleware/ # Middleware custom (image Path, error handling)
├── public/ # Immagini dei vini
├── app.js # Entry point dell’app
├── .env # Informazioni protette
└── package.json

# Setup locale

1. Clona il repository
   git clone https://github.com/Giunta-Giovanni/Boolwine_be.git
   cd Boolwine_be

2. Installa le dipendenze
   npm install

3. Configura Stripe
   • Registra un account su Stripe
   • Ottieni le chiavi API e aggiungile al .env (vedi esempio sotto)

4. Configura il database MySQL
   • Crea un database boolwine_db
   • Aggiorna il file .env con le credenziali

5. Avvia il server in sviluppo
   npm run watch

# .env Example

PORT=3000
FE_APP=http://localhost:5173

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=password
DB_NAME=boolwine_db

STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_PUBLIC_KEY=pk_test_xxx

EMAIL_USER=tuoindirizzo@libero.it
EMAIL_PASS=tuapassword

IMAGE_PATH=http://localhost:3000/images/

Nota: Per Stripe e l’invio email servono credenziali valide per test reali.

# API Endpoints

# Prodotti (vini)

• GET /api/wines
Restituisce tutti i vini con possibilità di filtrarli:
?type= → filtra per tipo di vino (rosso, bianco, discount)
?search= → ricerca fuzzy su nome, tipo, anno, provenienza, abbinamenti

• GET /api/wines/limited_stock
Restituisce i 3 vini con meno stock disponibile (ma con quantità > 0)

• GET /api/wines/wines_selection
Restituisce una selezione di vini in evidenza (ID predefiniti: 17, 33, 42)
• GET /api/wines/:id
Restituisce il dettaglio di un vino specifico in base al suo ID

• POST /api/wines → aggiunta vino (solo admin)

Ordini
• GET /api/orders
Restituisce tutti gli ordini raggruppati con i relativi vini e quantità
• GET /api/orders/:id
Restituisce il dettaglio di un ordine specifico con i vini associati
• POST /api/orders
Crea un nuovo ordine, aggiorna lo stock e genera la sessione di pagamento con Stripe

        Body JSON richiesto:

            {
            "fullName": "Mario Rossi",
            "email": "mario@example.com",
            "phoneNumber": "1234567890",
            "address": "Via Roma 10",
            "zipCode": "00100",
            "country": "Italy",
            "cart": [
                    { "wine_id": 1, "quantity": 2 },
                    { "wine_id": 5, "quantity": 1 }
                ]
            }

• PATCH /api/orders/order-success/:id
Imposta l’ordine come completato, invia email di conferma al cliente e all’ufficio

• PATCH /api/orders/order-cancelled/:id
Imposta l’ordine come cancellato e ripristina lo stock dei vini

# informazioni extra

    - Lo stock viene controllato prima di confermare l’ordine: se un vino non è disponibile, viene restituito un errore
    - 	Stripe crea un cliente e una sessione checkout durante la POST /api/orders
    - 	Nodemailer invia conferma ordine sia al cliente che all’account ufficio
    - 	Se un ordine viene cancellato (orderCancelled), lo stock viene ripristinato
    -	La funzione orderExpired esegue un controllo automatico ogni 30 minuti per cancellare ordini non completati o scaduti

# Sicurezza

    •	Middleware per proteggere rotte riservate (admin)
    •	CORS configurato solo per il dominio frontend

# Note

    •	Progetto pensato per essere collegato a un frontend React (Boolwine frontend)
    •	Stripe è attualmente in modalità test
    •	Consigliato usare Postman o un client HTTP per testare le API
