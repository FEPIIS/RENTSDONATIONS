const ModelDonation = require('../donation/donationModel');
const ModelDonor = require('../donor/donorModel');
const ModelItem = require('../item/itemModel');

exports.getDonations = async (req, res) => {
    try {
        const donations = await ModelDonation.find();
        if (donations.length === 0) {
            return res.status(404).json({ message: 'No se encontraron donaciones' });
        }
        res.json(donations);
    } catch (err) {
        console.error('Error al obtener donaciones:', err);
        res.status(500).json({ message: 'Ocurrió un error al obtener las donaciones' });
    }
};

exports.getDonationById = async (req, res) => {
    try {
        const donation = await ModelDonation.findById(req.params.id);
        if (!donation) {
            return res.status(404).json({ message: 'Donación no encontrada' });
        }
        res.json(donation);
    } catch (error) {
        console.error('Error al obtener la donación por Id:', error);
        res.status(500).json({ message: 'Ocurrió un error al obtener la donación' });
    }
};

exports.createDonation = async (req, res) => {
    const { Description, Date, Type, Amount, Transaction, DonorID, DonationDetails } = req.body;

    const requiredFields = ['Description', 'Date', 'Type', 'DonorID'];
    for (const field of requiredFields) {
        if (!req.body.hasOwnProperty(field)) {
            return res.status(400).json({ message: `El campo '${field}' es requerido` });
        }
    }

    const donorExists = await ModelDonor.exists({ _id: DonorID });
    if (!donorExists) {
        return res.status(400).json({ message: 'El ID del donador proporcionado no es válido' });
    }

    if (Type === 0) {
        if (DonationDetails && DonationDetails.length > 0) {
            return res.status(400).json({ message: 'No se permite ingresar DonationDetails para este tipo de donación' });
        }
    } else if (Type === 1) {
        if (Amount || Transaction) {
            return res.status(400).json({ message: 'No se permite ingresar Amount o Transaction para este tipo de donación' });
        }
    } else if (Type === 2) {
        if (!Amount || !Transaction || !DonationDetails || DonationDetails.length === 0) {
            return res.status(400).json({ message: 'Se requieren Amount, Transaction y al menos un DonationDetail para este tipo de donación' });
        }
    }

    if ((Type === 1 || Type === 2) && DonationDetails && DonationDetails.length > 0) {
        const invalidItemIds = [];
        for (const donationDetail of DonationDetails) {
            const itemExists = await ModelItem.exists({ _id: donationDetail.ItemID });
            if (!itemExists) {
                invalidItemIds.push(donationDetail.ItemID);
            }
        }
        if (invalidItemIds.length > 0) {
            return res.status(400).json({ message: 'Los siguientes IDs de items proporcionados no son válidos', invalidItemIds });
        }
    }

    try {
        const newDonation = await ModelDonation.create({
            Description,
            Date,
            Type,
            Amount: (Type === 0 || Type === 2) ? Amount : undefined,
            Transaction: (Type === 0 || Type === 2) ? Transaction : undefined,
            DonorID,
            DonationDetails: (Type !== 0 && DonationDetails) ? DonationDetails : undefined
        });

        if (Type !== 0 && DonationDetails && DonationDetails.length > 0) {
            for (const donationDetail of DonationDetails) {
                await ModelItem.findByIdAndUpdate(donationDetail.ItemID, { $inc: { Quantity: donationDetail.Quantity } });
            }
        }

        return res.status(201).json({ message: 'Donación registrada exitosamente', donation: newDonation });
    } catch (error) {
        console.error('Error al crear la donación:', error);
        return res.status(400).json({ message: 'Ocurrió un error al crear la donación' });
    }
};

exports.disableDonation = async (req, res) => {
    try {
        const donation = await ModelDonation.findById(req.params.id);
        if (!donation) {
            return res.status(404).json({ message: 'Donación no encontrada' });
        }
        
        const promises = [];

        for (const donationDetail of donation.DonationDetails) {
            const item = await ModelItem.findById(donationDetail.ItemID);
            if (item) {
                item.Quantity -= donationDetail.Quantity; // Deshacer el cambio
                promises.push(item.save());
            }
        }
        
        donation.disabled = true; 
        promises.push(donation.save());
        
        await Promise.all(promises);

        res.json({ message: 'Donación inhabilitada exitosamente' });
    } catch (error) {
        console.error('Error al inhabilitar la donación:', error);
        res.status(500).json({ message: 'Ocurrió un error al inhabilitar la donación' });
    }
};

exports.enableDonation = async (req, res) => {
    try {
        const donation = await ModelDonation.findById(req.params.id);
        if (!donation) {
            return res.status(404).json({ message: 'Donación no encontrada' });
        }
        
        const promises = [];

        for (const donationDetail of donation.DonationDetails) {
            const item = await ModelItem.findById(donationDetail.ItemID);
            if (item) {
                item.Quantity += donationDetail.Quantity; 
                promises.push(item.save());
            }
        }
        
        donation.disabled = false;
        promises.push(donation.save());
        
        await Promise.all(promises);

        res.json({ message: 'Donación habilitada exitosamente' });
    } catch (error) {
        console.error('Error al habilitar la donación:', error);
        res.status(500).json({ message: 'Ocurrió un error al habilitar la donación' });
    }
};