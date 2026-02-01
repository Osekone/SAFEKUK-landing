export default async function handler(req, res) {
    // 1. Solo permitimos peticiones POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método no permitido' });
    }

    const { email, nombre, apellidos, telefono } = req.body;
    const BREVO_API_KEY = process.env.BREVO_API_KEY;

    // 2. Limpieza básica del teléfono (quitar espacios, guiones y asegurar el +34)
    let limpioTelefono = telefono.replace(/\s+/g, '').replace(/-/g, '');
    if (!limpioTelefono.startsWith('+')) {
        limpioTelefono = `+34${limpioTelefono}`; // Ajusta el código de país si no es España
    }

    try {
        const response = await fetch('https://api.brevo.com/v3/contacts', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'api-key': BREVO_API_KEY
            },
            body: JSON.stringify({
                email: email,
                updateEnabled: true, // Actualiza el contacto si el email ya existe
                listIds: [4],
                attributes: {
                    "NOMBRE": nombre,
                    "APELLIDOS": apellidos,
                    "SMS": limpioTelefono,
                    "TAG": "LANDING_V1",
                    "ORIGEN": "Web Oficial"
                }
            })
        });

        const data = await response.json();

        // 3. Manejo de respuestas
        if (response.ok) {
            return res.status(200).json({ message: 'Suscripción exitosa' });
        } else {
            // Caso específico: El teléfono ya pertenece a otro usuario
            if (data.code === 'duplicate_parameter') {
                return res.status(409).json({ 
                    error: 'El email o el teléfono ya están registrados por otro usuario.' 
                });
            }
            
            // Otros errores de Brevo (formato, etc.)
            return res.status(400).json({ 
                error: data.message || 'Error en los datos enviados.' 
            });
        }
    } catch (error) {
        console.error('Error de servidor:', error);
        return res.status(500).json({ error: 'Error interno del servidor.' });
    }
}
