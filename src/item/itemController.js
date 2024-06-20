const mongoose = require('mongoose');
const ModelItem = require('../item/itemModel');
const ModelCategory = require('../category/categoryModel');
const ModelRent = require('../rent/rentModel');

exports.getItems = async (req, res) => {
    try {
        const items = await ModelItem.find().populate('Category');
        if (!items || items.length === 0) {
            return res.status(404).json({ message: 'No se encontraron enseres' });
        }
        res.json(items);
    } catch (error) {
        console.error('Error al obtener enseres:', error);
        res.status(500).json({ message: 'Ocurrió un error al obtener los enseres' });
    }
};

exports.getItemId = async (req, res) => {
    try {
        const itemId = req.params.id;
        const item = await ModelItem.findById(itemId).populate('Category');
        
        if (!item) {
            return res.status(404).json({ message: 'enser no encontrado' });
        }

        res.json(item);
    } catch (error) {
        console.error('Error al obtener el enser:', error);
        res.status(500).json({ message: 'Ocurrió un error al obtener el enser' });
    }
};


exports.createItem = async (req, res) => {
    try {
        const { Name, Reference, Quantity, Location, ItemPrice, Description, RentalPrice, State, RentState, Category } = req.body;

        // Validar que todos los campos requeridos estén presentes
        if (!Name || !Reference || !Quantity || !Location || !ItemPrice || !Description || !RentalPrice || !State || !RentState || !Category) {
            return res.status(400).json({ message: 'Faltan campos obligatorios para crear el ítem' });
        }

        // Validar que los estados sean 0 o 1
        if (State !== 0 && State !== 1) {
            return res.status(400).json({ message: 'El estado debe ser 0 (inactivo) o 1 (activo)' });
        }
        if (RentState !== 0 && RentState !== 1) {
            return res.status(400).json({ message: 'El estado de alquiler debe ser 0 (inactivo) o 1 (activo)' });
        }

        // Validar si la categoría existe y está activa
        const existingCategory = await ModelCategory.findById(Category);
        if (!existingCategory || existingCategory.State !== 1) {
            return res.status(400).json({ message: 'La categoría seleccionada no está activa o no existe' });
        }

        // Crear el nuevo ítem
        const newItem = new ModelItem({
            Name,
            Reference,
            Quantity,
            Location,
            ItemPrice,
            Description,
            RentalPrice,
            State,
            RentState,
            Category
        });

        // Guardar el nuevo ítem en la base de datos
        await newItem.save();

        res.status(201).json({ message: 'Ítem creado exitosamente', item: newItem });
    } catch (error) {
        console.error('Ocurrió un error al crear el ítem:', error);

        // Verificar si el error es debido a la validación de la categoría
        if (error.errors && error.errors.Category && error.errors.Category.kind === 'user defined') {
            return res.status(400).json({ message: error.errors.Category.message });
        }

        res.status(500).json({ message: 'Ocurrió un error al crear el ítem' });
    }
};


exports.updateItem = async (req, res) => {
    try {
        const itemId = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(itemId)) {
            return res.status(400).json({ message: 'ID de ítem no válido' });
        }

        const existingItem = await ModelItem.findById(itemId);
        if (!existingItem) {
            return res.status(404).json({ message: 'El ítem no existe' });
        }

        const updates = req.body;
        
        if (updates.State !== undefined && updates.State !== 0 && updates.State !== 1) {
            return res.status(400).json({ message: 'El valor de State debe ser 0 o 1' });
        }

        if (updates.RentState !== undefined && updates.RentState !== 0 && updates.RentState !== 1) {
            return res.status(400).json({ message: 'El valor de RentState debe ser 0 o 1' });
        }

        if (updates.Category) {
            if (!mongoose.Types.ObjectId.isValid(updates.Category)) {
                return res.status(400).json({ message: 'ID de categoría no válido' });
            }

            const existingCategory = await ModelCategory.findById(updates.Category);
            if (!existingCategory) {
                return res.status(404).json({ message: 'La categoría no existe' });
            }

            if (existingCategory.State !== 1) {
                return res.status(400).json({ message: 'La categoría seleccionada no está activa' });
            }
        }

        for (const key in updates) {
            if (updates.hasOwnProperty(key)) {
                existingItem[key] = updates[key];
            }
        }

        await existingItem.save();

        res.status(200).json({ message: 'Ítem actualizado exitosamente', item: existingItem });
    } catch (error) {
        console.error('Ocurrió un error al actualizar el ítem:', error);
        res.status(500).json({ message: 'Ocurrió un error al actualizar el ítem' });
    }
}

// exports.deleteItem = async (req, res) => {
//     const itemId = req.params.id;

//     try {
//         if (!mongoose.Types.ObjectId.isValid(itemId)) {
//             return res.status(400).json({ message: 'ID de ítem no válido' });
//         }

//         const donationExists = await ModelDonation.exists({ 'DonationDetails.ItemID': itemId });
//         if (donationExists) {
//             return res.status(400).json({ message: 'El ítem está vinculado a una donación y no se puede eliminar' });
//         }

//         const rentExists = await ModelRent.exists({ 'RentDetails.ItemID': itemId });
//         if (rentExists) {
//             return res.status(400).json({ message: 'El ítem está vinculado a un alquiler y no se puede eliminar' });
//         }

//         const deletedItem = await ModelItem.findByIdAndDelete(itemId);

//         if (!deletedItem) {
//             return res.status(404).json({ message: 'El ítem no se encontró' });
//         }

//         res.json({ message: 'Ítem eliminado exitosamente', deletedItemId: deletedItem._id });
//     } catch (error) {
//         console.error('Ocurrió un error al eliminar el ítem:', error);
//         res.status(500).json({ message: 'Ocurrió un error al eliminar el ítem' });
//     }
// };

exports.deleteItem = async (req, res) => {
    const itemId = req.params.id;

    try {
        // Verificar si el ID es válido
        if (!mongoose.Types.ObjectId.isValid(itemId)) {
            return res.status(400).json({ message: 'ID de ítem no válido' });
        }

        // Eliminar el ítem
        const deletedItem = await ModelItem.findByIdAndDelete(itemId);
        if (!deletedItem) {
            return res.status(404).json({ message: 'El ítem no se encontró' });
        }

        // Responder con éxito
        res.json({ message: 'Ítem eliminado exitosamente', deletedItemId: deletedItem._id });
    } catch (error) {
        // Manejo de errores
        console.error('Ocurrió un error al eliminar el ítem:', error);
        res.status(500).json({ message: 'Ocurrió un error al eliminar el ítem' });
    }
};