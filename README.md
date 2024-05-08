# Labb 4 backend
Express databas med mongodb integration samt cors och json tokens kompatabilitet. Kan utföra enkla operationer relaterade till login/authentication processer. Sparar datan i ett dokument i nedanstående struktur:
## databas inehåll
### Användarnamn: String
### Lösenord (sparas hashat)
### Skapnings Datum: Automatiskt lagrar dagens datum
### Namn: Individens Namn
### email: email i rätt format
## validering
Apin har grundläggande validering av inmatning och returnering av felvvärden i en array med formatet {error: array}. Databasen använder sig av en env fil för det mesta närverks relaterade informationen. Har ett antal debug operationer utan säkerhet som är utkomenterade.
Har nedanstånde operationer:
## /login
Tar emot användarnamn och lösenord för att validera och logga in till ett existerande konto, ifall operationen lyckas returneras en jwt token som webbplatsen sparar på localstorage, denna används till senare operationer och webbplats logik.
## /register
Registrerar en ny användare om ett object med alla fält utom datum skickas, såvida informationen passerar all validation.
## /secret
Authentierar användaren baserat på skickat token, för att kunna verifiera inloggning. Kräver att token skickas med i request huvudet.
## /data
Hämtar användarelaterat data efter en authentisering sker. Kräver att token skickas med i request huvudet samt användarnamnet som skickas ifrån localstorage.

## Utvärdering:
Skapandet av apin gick bra och var inte så annorlunda ifrån tidigare uppgifter, tog lite läsning att förstå sig på jwt till en hyfsat nivå men tycker det hela har varit lärorikt. Det nämndes på genomgången att det fanns något bra sätt att skapa standardtokenen men kollade inte upp det så gjorde bara en extremt lång string i env filen.
