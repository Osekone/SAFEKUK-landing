export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).end();

    const { email, nombre, apellidos, telefono } = req.body;
    const BREVO_API_KEY = process.env.BREVO_API_KEY;

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
                listIds: [4],
                attributes: {
                    "NOMBRE": nombre,
                    "APELLIDOS": apellidos,
                    "SMS": telefono, // Brevo usa SMS para el campo de teléfono
                    "TAG": "LANDING_V1"
                }
            })
        });

        if (response.ok) {
            return res.status(200).json({ message: 'Éxito' });
        } else {
            const errorData = await response.json();
            return res.status(400).json({ error: errorData.message });
        }
    } catch (error) {
        return res.status(500).json({ error: 'Error de servidor' });
    }
}
