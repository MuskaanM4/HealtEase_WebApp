# Beroepsproduct: Product Requirements Document (PRD) – HealthEase

## 1. Projectomschrijving

HealthEase is een "One-Stop Pharmacy" webapplicatie ontworpen voor de Surinaamse markt. De applicatie fungeert als een digitaal platform waar klanten medicijnen en verzorgingsproducten kunnen zoeken, vergelijken en bestellen.

## 2. Technische Stack

* 
**Frontend**: HTML5, CSS3 (Custom styling + Bootstrap 5 Framework).


* 
**Backend**: Node.js met het **Express.js** framework.


* 
**Database**: **MySQL**, aangestuurd via de **Prisma ORM** voor type-safe databasebeheer en migraties.



## 3. Functionele Eisen (gebaseerd op mockups)

### 3.1 Gebruikersbeheer & Navigatie

* **Authenticatie**: Gebruikers kunnen inloggen en registreren via specifieke schermen met velden voor e-mail, wachtwoord en herhaalwachtwoord.
* **Navigatie (Sticky Header)**: Bevat een zoekbalk, winkelwagen-icoon met teller en een hamburger-menu.
* **Slide-out Menu**: Een zijbalk met navigatielinks naar Home, Shop, Cart, About Us, Feedback, FAQ en Contact.

### 3.2 Product- & Categoriebeheer

* **Shop by Category**: Een grid met diverse categorieën waaronder Medications, Health & Wellness, Personal Care, Baby & Kids, en Beauty & Cosmetics.
* **Everyday Must-Haves**: Specifieke collecties zoals 'Morning Essentials', 'On-the-go' en 'Night Care'.
* **Zoekfunctie**: Een actieve zoekbalk om direct in de voorraad van aangesloten apotheken te zoeken.

### 3.3 Winkelwagen & Checkout-logica

* **Prijsberekening**: De applicatie moet automatisch de volgende kosten berekenen:
* **Bag Total**: Totaalprijs van de producten.
* **Administratie Fee**: SRD 30.
* **Platform Fee**: SRD 50.
* **Delivery Fee**: SRD 100 (alleen van toepassing bij verzending).


* **Verzendmethoden**: Gebruikers kiezen tussen 'Pick up' (afhalen) of 'Delivery' (bezorgen).
* **Bestelformulier**: Invoer van naam, telefoonnummer, e-mail en gewenste apotheeklocatie/afhaaltijd.

### 3.4 Informatievoorziening & Support

* **FAQ Sectie**: Een interactief overzicht met veelgestelde vragen over voorraadstatus en receptvereisten.
* **Get in Touch**: Een contactformulier met de optie om te kiezen tussen 'Consulting' en 'Sponsoring'.
* **Klantbeoordelingen**: Weergave van 'Client Testimonials' inclusief sterren-ratings en tekstuele feedback van klanten.

## 4. Niet-Functionele Eisen

* 
**Visuele Match**: De applicatie moet voor minimaal 50% overeenkomen met de visuele presentatie in de mockups.


* **Responsiviteit**: De interface moet optimaal functioneren op zowel desktop als mobiele apparaten.
* **Gebruiksvriendelijkheid**: Het design moet een rustgevende uitstraling hebben door gebruik van het specifieke kleurenpalet (mintgroen/blauw).

## 5. Database Modellen (Prisma Schema)

* **User**: Opslag van accountgegevens en inlog-credentials.
* **Product**: Inclusief categorieën en sub-collecties (bijv. 'Night Care').
* **Order**: Registratie van geselecteerde items, gekozen verzendmethode en berekende fees.
* **Feedback/Review**: Opslag van klantnamen, ratings en commentaren.
* **ContactMessage**: Berichten verzonden via de 'Get in Touch' pagina.