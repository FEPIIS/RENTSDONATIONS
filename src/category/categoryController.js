const mongoose = require('mongoose');
const ModelCategory = require('../category/categoryModel');
const ModelItem = require('../item/itemModel');

exports.getCategories = async (req, res) => {
    try {
        const categories = await ModelCategory.find();

        if (!categories || categories.length === 0) {
            return res.status(404).json({ message: 'No se encontraron categorías en la base de datos' });
        }

        res.json(categories);
    } catch (error) {
        console.error('Error al obtener categorías:', error.message);
        res.status(500).json({ message: 'Ocurrió un error al obtener las categorías, por favor inténtelo de nuevo más tarde' });
    }
};


exports.getCategoryId = async (req, res) => {
    const categoryId = req.params.id;

    try {
        const category = await ModelCategory.findById(categoryId);

        if (!category) {
            return res.status(404).json({ message: 'No se encontró ninguna categoría con el ID proporcionado' });
        }

        res.json(category);
    } catch (error) {
        console.error('Error al buscar la categoría por ID:', error.message);
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'El ID de categoría proporcionado no es válido' });
        }
        res.status(500).json({ message: 'Ocurrió un error al buscar la categoría por ID, por favor inténtelo de nuevo más tarde' });
    }
};

exports.createCategory = async (req, res) => {
    try {
        const { Name, Description, State } = req.body;

        if (!Name || !Description) {
            return res.status(400).json({ message: 'Faltan campos obligatorios para registrar la categoría' });
        }

        // Si no se proporciona un valor para el estado, establecerlo en 1 por defecto
        const newState = State !== undefined ? State : 1;

        const category = new ModelCategory({
            Name,
            Description,
            State: newState
        });

        const newCategory = await category.save();
        
        res.status(201).json(newCategory);
    } catch (error) {
        console.error('Ocurrió un error al registrar la categoría:', error);
        res.status(500).json({ message: 'Ocurrió un error al registrar la categoría' });
    }
};
// exports.updateCategory = async (req, res) => {
//     try {
//         const categoryId = req.params.id;
//         const { Name, Description, State } = req.body;

//         if (!mongoose.Types.ObjectId.isValid(categoryId)) {
//             return res.status(400).json({ message: 'ID de categoría no válido' });
//         }

//         const existingCategory = await ModelCategory.findById(categoryId);
//         if (!existingCategory) {
//             return res.status(404).json({ message: 'La categoría no existe' });
//         }

//         if (!Name && !Description && State === undefined) {
//             return res.status(400).json({ message: 'No se proporcionaron datos para actualizar' });
//         }

//         // Verificar si la categoría está asociada a algún ítem y su estado
//         if (State === 0) {
//             const itemsWithCategory = await ModelItem.exists({ Category: categoryId });
//             if (itemsWithCategory) {
//                 return res.status(400).json({ message: 'No se puede establecer el estado como inactivo porque la categoría está vinculada a algún ítem' });
//             }
//         }

//         if (State !== 0 && State !== 1) {
//             return res.status(400).json({ message: 'El valor de State debe ser 0 o 1' });
//         }

//         existingCategory.Name = Name || existingCategory.Name;
//         existingCategory.Description = Description || existingCategory.Description;
//         existingCategory.State = State !== undefined ? State : existingCategory.State;

//         await existingCategory.save();

//         res.json(existingCategory);
//     } catch (error) {
//         console.error('Error al actualizar la categoría:', error.message);
//         res.status(500).json({ message: 'Ocurrió un error al actualizar la categoría' });
//     }
// };


exports.updateCategory = async (req, res) => {
    try {
        const categoryId = req.params.id;
        const { Name, Description, State } = req.body;

        if (!mongoose.Types.ObjectId.isValid(categoryId)) {
            return res.status(400).json({ message: 'ID de categoría no válido' });
        }

        const existingCategory = await ModelCategory.findById(categoryId);
        if (!existingCategory) {
            return res.status(404).json({ message: 'La categoría no existe' });
        }

        if (!Name && !Description && State === undefined) {
            return res.status(400).json({ message: 'No se proporcionaron datos para actualizar' });
        }

        // Convertir State a número
        const parsedState = Number(State);

        if (parsedState !== undefined && parsedState !== 0 && parsedState !== 1) {
            return res.status(400).json({ message: 'El valor de State debe ser 0 o 1' });
        }

        existingCategory.Name = Name || existingCategory.Name;
        existingCategory.Description = Description || existingCategory.Description;

        // Solo actualiza el estado si se proporcionó un valor nuevo
        if (parsedState !== undefined) {
            existingCategory.State = parsedState;
        }

        await existingCategory.save();

        res.json(existingCategory);
    } catch (error) {
        console.error('Error al actualizar la categoría:', error.message);
        res.status(500).json({ message: 'Ocurrió un error al actualizar la categoría' });
    }
};


exports.deleteCategory = async (req, res) => {
    const categoryId = req.params.id;

    try {
        const itemsWithCategory = await ModelItem.find({ CategoryID: categoryId });

        if (itemsWithCategory && itemsWithCategory.length > 0) {
            return res.status(400).json({ message: 'No se puede eliminar la categoría porque hay ítems asociados a ella' });
        }

        const deletedCategory = await ModelCategory.findByIdAndDelete(categoryId);
        if (!deletedCategory) {
            return res.status(404).json({ message: 'La categoría no se encontró' });
        }
        res.json({ message: 'Categoría eliminada exitosamente' });
    } catch (error) {
        console.error('Ocurrió un error al eliminar la categoría:', error);
        res.status(500).json({ message: 'Ocurrió un error al eliminar la categoría' });
    }
};

