

export const error = (message, stack) =>{

   return `
<html>
    <head>
        <style>
            body {
                background-color: #111; 
                color: #fff; 
                font-family: monospace; 
                padding: 20px;
            }
            h1 { 
                color: #ff3333; 
            }
            pre { 
                background: #222; 
                padding: 15px; 
                border-radius: 5px; 
                overflow-x: auto; 
                }
        </style>
    </head>
    <body>
        <div class = "error-box">
            <h1> Reporte de Error </h1>
            <h2>${message}</h2>
        </div>
            <h3> Reporte de Error </h3>
            <pre>${stack}</pre>        
    </body>
</html>
`
}