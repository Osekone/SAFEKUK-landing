export default async function handler(req, res) {
    // Solo permitimos peticiones POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método no permitido' });
    }

    const { email } = req.body;
    const BREVO_API_KEY = process.env.BREVO_API_KEY; // Variable segura

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
                updateEnabled: true,
                listIds: [2], // Asegúrate de que este ID de lista existe en tu Brevo
                attributes: {
                    "TAG": "LANDING_V1",
                    "ORIGEN": "Web Oficial"
                }
            })
        });

        const data = await response.json();

        if (response.ok) {
            return res.status(200).json({ message: 'Suscrito con éxito' });
        } else {
            return res.status(400).json({ error: data.message || 'Error en Brevo' });
        }
    } catch (error) {
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
}
