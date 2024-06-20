const ModelDonor = require('../donor/donorModel');
const ModelDonation = require('../donation/donationModel');

function validateDonorData(data) {
    const { NIT, CompanyName, Contact, Email, PhoneNumber, Location, CompanyType } = data;
    if (!NIT || typeof NIT !== 'string') {
        return 'NIT inválido o ausente';
    }
    if (!CompanyName || typeof CompanyName !== 'string') {
        return 'Nombre de la empresa inválido o ausente';
    }
    if (!Contact || typeof Contact !== 'string') {
        return 'Contacto inválido o ausente';
    }
    if (!Email || typeof Email !== 'string' || !Email.includes('@')) {
        return 'Email inválido o ausente';
    }
    if (!PhoneNumber || typeof PhoneNumber !== 'string') {
        return 'Número de teléfono inválido o ausente';
    }
    if (!Location || typeof Location !== 'string') {
        return 'Ubicación inválida o ausente';
    }
    if (!CompanyType || typeof CompanyType !== 'string') {
        return 'Tipo de empresa inválido o ausente';
    }
    return null;
}

exports.getDonors = async (req, res) => {
    try {
        const donors = await ModelDonor.find();
        if (donors.length === 0) {
            return res.status(404).json({ message: 'No se encontraron donadores' });
        }
        res.json(donors);
    } catch (err) {
        console.error('Error al obtener donadores:', err);
        res.status(500).json({ message: 'Ocurrió un error al obtener los donadores' });
    }
};

exports.getDonorById = async (req, res) => {
    try {
        const donor = await ModelDonor.findById(req.params.id);
        if (!donor) {
            return res.status(404).json({ message: 'Donador no encontrado' });
        }
        res.json(donor);
    } catch (error) {
        console.error('Error al obtener el donador por Id:', error);
        res.status(500).json({ message: 'Ocurrió un error al obtener el donador' });
    }
};

exports.createDonor = async (req, res) => {
    const validationError = validateDonorData(req.body);
    if (validationError) {
        return res.status(400).json({ message: validationError });
    }

    const { NIT, CompanyName, Contact, Email, PhoneNumber, Location, CompanyType } = req.body;
    const donor = new ModelDonor({
        NIT,
        CompanyName,
        Contact,
        Email,
        PhoneNumber,
        Location,
        CompanyType
    });

    try {
        const newDonor = await donor.save();
        res.status(201).json({ message: 'Donador registrado exitosamente', donor: newDonor });
    } catch (error) {
        console.error('Error al crear el donador:', error);
        res.status(400).json({ message: 'Ocurrió un error al crear el donador', error: error.message });
    }
};

exports.updateDonor = async (req, res) => {
    const validationError = validateDonorData(req.body);
    if (validationError) {
        return res.status(400).json({ message: validationError });
    }

    try {
        const donor = await ModelDonor.findById(req.params.id);
        if (!donor) {
            return res.status(404).json({ message: 'Donador no encontrado' });
        }

        const { NIT, CompanyName, Contact, Email, PhoneNumber, Location, CompanyType } = req.body;
        if (NIT != null) donor.NIT = NIT;
        if (CompanyName != null) donor.CompanyName = CompanyName;
        if (Contact != null) donor.Contact = Contact;
        if (Email != null) donor.Email = Email;
        if (PhoneNumber != null) donor.PhoneNumber = PhoneNumber;
        if (Location != null) donor.Location = Location;
        if (CompanyType != null) donor.CompanyType = CompanyType;

        const updatedDonor = await donor.save();
        res.status(200).json({ message: 'Donador actualizado exitosamente', donor: updatedDonor });
    } catch (error) {
        console.error('Error al actualizar el donador:', error);
        res.status(400).json({ message: 'Ocurrió un error al actualizar el donador', error: error.message });
    }
};

exports.deleteDonor = async (req, res) => {
    try {
        const donor = await ModelDonor.findById(req.params.id);
        if (!donor) {
            return res.status(404).json({ message: 'Donador no encontrado' });
        }
        const donations = await ModelDonation.find({ DonorID: donor._id });
        if (donations.length > 0) {
            return res.status(400).json({ message: 'No se puede eliminar el donador porque tiene donaciones asociadas' });
        }

        await donor.deleteOne();
        res.json({ message: 'Donador eliminado exitosamente' });
    } catch (error) {
        console.error('Error al eliminar el donador:', error);
        res.status(500).json({ message: 'Ocurrió un error al eliminar el donador' });
    }
};

exports.disableDonor = async (req, res) => {
    try {
        const donor = await ModelDonor.findById(req.params.id);

        if (!donor) {
            return res.status(404).json({ message: 'Donador no encontrado' });
        }

        donor.State = false;

        await donor.save();

        res.json({ message: 'Donador inhabilitado exitosamente', donor });
    } catch (error) {
        console.error('Error al inhabilitar el donador:', error);
        res.status(500).json({ message: 'Ocurrió un error al inhabilitar el donador' });
    }
};

exports.enableDonor = async (req, res) => {
    try {
        const donor = await ModelDonor.findById(req.params.id);

        if (!donor) {
            return res.status(404).json({ message: 'Donador no encontrado' });
        }

        donor.State = true;

        await donor.save();

        res.json({ message: 'Donador habilitado exitosamente', donor });
    } catch (error) {
        console.error('Error al habilitar el donador:', error);
        res.status(500).json({ message: 'Ocurrió un error al habilitar el donador' });
    }
};