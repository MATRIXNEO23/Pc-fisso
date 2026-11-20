# PC fisso

Configuratore aggiornato il 20 novembre 2026.

- [Apri il configuratore online](https://MATRIXNEO23.github.io/Pc-fisso/) — richiede GitHub Pages attivo su `main /docs`.
- [Configuratore HTML](Configuratore_PC_Conegliano.html): scaricabile e utilizzabile anche offline.
- [Annunci GPU e note](Annuncio_RTX_5060_Ti_e_note.txt): gli annunci e le note precedenti restano disponibili.

## Funzioni

Ogni pagina è un configuratore completo e indipendente. Usa **Nuovo preventivo**, **Duplica**, **Rinomina** ed **Elimina preventivo**. Un nuovo preventivo riprende il catalogo attuale senza componenti selezionati; duplicare conserva anche le scelte. L'ultimo preventivo non può essere eliminato.

Su telefono i prodotti diventano schede; su PC si usa la tabella. Se manca una foto, il riquadro apre **Google Immagini con il nome del prodotto**. **Imposta foto** accetta un link diretto all'immagine o un file. Le foto caricate vengono ridimensionate a un massimo di 1200 pixel, quelle presenti si ingrandiscono in un pop-up.

Preferiti, ordine prodotti, più offerte per prodotto e link di acquisto cliccabili nel preventivo HTML/PDF sono conservati. Usa la stampa del browser e scegli Salva come PDF.

## Salvataggi e sincronizzazione

Le modifiche sono salvate automaticamente nel browser. **Esporta configuratore HTML** conserva tutte le pagine in una copia portatile. **Salva online** scrive tutti i preventivi in [shared-config.json](shared-config.json), così sono leggibili anche dall'assistente e dagli altri dispositivi. **Salva in repository** aggiunge un salvataggio finale: conserva gli stessi dati anche dentro l’HTML completo, aggiornando insieme `shared-config.json`, `Configuratore_PC_Conegliano.html` e `docs/index.html`. L’HTML contiene tutte le pagine del preventivo ed è utilizzabile anche offline. Il sito si aggiorna dopo la pubblicazione automatica di GitHub Pages. **Carica online** recupera la versione condivisa e chiede conferma prima di sostituire quella locale.

Per scrivere dal sito occorre un token GitHub a grana fine, limitato a **MATRIXNEO23/Pc-fisso**, con permesso **Contents: Read and write**. Il token resta nella memoria della pagina, non viene salvato nel browser, esportato o inserito nei file pubblici. Chi non ha autorizzazione in scrittura può leggere i preventivi e lavorare su copie locali.

La repository è pubblica: i preventivi e le immagini salvati online sono pubblici. Evitare dati personali dei clienti. Foto remote non disponibili o protette possono essere sostituite da un file caricato.

## Attivazione GitHub Pages

In **Settings → Pages**, scegliere **Deploy from a branch**, branch **main**, cartella **/docs**, quindi **Save**. Il sito sarà servito all'indirizzo indicato sopra. L'applicazione è statica; le scritture autorizzate usano l'API gratuita di GitHub.

Il file HTML principale e `docs/index.html` devono essere aggiornati insieme quando si modifica il programma; **Salva online** aggiorna solo `shared-config.json`, mentre **Salva in repository** aggiorna tutti e tre i file in un unico commit. Il salvataggio completo legge prima l’ultima sorgente HTML e rifiuta un aggiornamento concorrente del ramo, preservando i dati locali in caso di errore.

## Verifiche

Controllate la sintassi JavaScript, la migrazione dei dati precedenti, l'indipendenza dei preventivi, creazione/duplicazione/rinomina/eliminazione, persistenza delle scelte vuote, foto, validazione dei link, ricerca Google, esportazione dei link di acquisto, preferiti e ordine. Il totale iniziale resta **1.381,32 € più le spedizioni mancanti**. Verifica visiva su dispositivi reali ancora da completare.

Prezzi, disponibilità, condizione nuovo/usato e compatibilità da confermare prima dell'acquisto.
