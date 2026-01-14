const escapeHtml = (value) => {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
}

export const error = (message, stack) =>{
    const safeMessage = escapeHtml(message)
    const safeStack = stack ? escapeHtml(stack) : null

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
            <h2>${safeMessage}</h2>
        </div>
            ${safeStack ? `<h3> Reporte de Error </h3><pre>${safeStack}</pre>` : ''}
    </body>
</html>
`
}