const ModelCustomer = require('../customer/customerModel');

exports.getCustomers = async (req, res) => {
    try {
        const customers = await ModelCustomer.find();
        if (customers.length === 0) {
            return res.status(404).json({ message: 'No se encontraron clientes' });
        }
        res.json(customers);
    } catch (err) {
        console.error('Error al obtener clientes:', err);
        res.status(500).json({ message: 'Ocurrió un error al obtener los clientes' });
    }
};

exports.getCustomerId = async (req, res) => {
    try {
        const customer = await ModelCustomer.findById(req.params.id);
        if (!customer) {
            return res.status(404).json({ message: 'Cliente no encontrado' });
        }
        res.json(customer);
    } catch (error) {
        res.status(500).json({ message: 'Ocurrió un error al obtener el cliente' });
    }
};

exports.createCustomer = async (req, res) => {
    const { FirstName, LastName, DocumentType, DocumentNumber, PhoneNumber, Email, Location, CustomerType, State } = req.body;

    // Verificar campos obligatorios
    if (!FirstName || !LastName || !DocumentType || !DocumentNumber || !PhoneNumber || !Email || !Location || !CustomerType || State === undefined) {
        return res.status(400).json({ message: 'Faltan campos obligatorios para crear el cliente' });
    }

    // Verificar tipo de datos para DocumentNumber, PhoneNumber y State
    if (isNaN(DocumentNumber) || isNaN(PhoneNumber) || isNaN(State)) {
        return res.status(400).json({ message: 'DocumentNumber, PhoneNumber y State deben ser números' });
    }

    const customer = new ModelCustomer({
        FirstName,
        LastName,
        DocumentType,
        DocumentNumber,
        PhoneNumber,
        Email,
        Location,
        CustomerType,
        State
    });

    try {
        const newCustomer = await customer.save();
        res.status(201).json(newCustomer);
    } catch (error) {
        res.status(400).json({ message: 'Ocurrió un error al crear el cliente' });
    }
};

exports.updateCustomer = async (req, res) => {
    try {
        const customer = await ModelCustomer.findById(req.params.id);
        if (!customer) {
            return res.status(404).json({ message: 'Cliente no encontrado' });
        }

        const { FirstName, LastName, DocumentType, DocumentNumber, PhoneNumber, Email, Location, CustomerType, State } = req.body;
        if (FirstName != null) customer.FirstName = FirstName;
        if (LastName != null) customer.LastName = LastName;
        if (DocumentType != null) customer.DocumentType = DocumentType;
        if (DocumentNumber != null) customer.DocumentNumber = DocumentNumber;
        if (PhoneNumber != null) customer.PhoneNumber = PhoneNumber;
        if (Email != null) customer.Email = Email;
        if (Location != null) customer.Location = Location;
        if (CustomerType != null) customer.CustomerType = CustomerType;
        if (State != null) customer.State = State;

        const updatedCustomer = await customer.save();
        res.json(updatedCustomer);
    } catch (error) {
        res.status(400).json({ message: 'Ocurrió un error al actualizar el cliente' });
    }
};

exports.deleteCustomer = async (req, res) => {
    try {
        const customer = await ModelCustomer.findById(req.params.id);
        if (!customer) {
            return res.status(404).json({ message: 'Cliente no encontrado' });
        }
        await ModelCustomer.deleteOne({ _id: req.params.id });
        res.json({ message: 'Cliente eliminado' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ocurrió un error al eliminar el cliente' });
    }
};
