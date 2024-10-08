export const HomeTemplate = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Research-Pal</title>
    <link
      href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
      rel="stylesheet"
      integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH"
      crossorigin="anonymous"
    />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap"
      rel="stylesheet"
    />
    <style>
      body {
        font-family: "Poppins", sans-serif;
      }
      .header {
        font-size: 2rem;
        font-weight: 900px;
        text-transform: uppercase;
        text-align: center;
      }
      .card {
        width: fit-content;
      }
      .font-weight-bold{
        font-weight: 600;
      }
    </style>
  </head>
  <body class="vw-100 vh-100 d-flex flex-column">
    <div
      class="d-flex flex-1 h-100 w-100 p-5 overflow-auto flex-column gap-5 align-items-center"
      style="background-color: #fcffde"
    >
      <div class="header">
        Welcome to Research Pal 📚
      </div>
      <div>
        Stay tuned for a better way to take notes, track research, and stay
        organized.
      </div>
      <div class="card" >
        <div
          class="card-header text-center font-weight-bold" style="background-color: #bcd062"
        >
          Research Pal
        </div>

        <div class="card-body">
          <ul>
            <li>
              <strong>📅 Date-based Notes: </strong> Easily track notes across
              different research sessions.
            </li>
            <li>
              <strong>🏷️ Tagging & Categorization: </strong>Find your notes
              quickly with custom tags.
            </li>
            <li><strong>And more to come... 🚀 </strong></li>
          </ul>
        </div>
      </div>
      <div>
        Launching December 2024 (Yeah, we know... It's been a year in the
        making, but good things take time, right? 😅)
      </div>
    </div>
  </body>
</html>
`;
