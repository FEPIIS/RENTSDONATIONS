const mongoose = require('mongoose');
const ModelRent = require('../rent/rentModel');
const ModelCustomer = require('../customer/customerModel');
const ModelItem = require('../item/itemModel');

exports.getRents = async (req, res) => {
    try {
        const rents = await ModelRent.find().populate('CustomerId');
        if (rents.length === 0) {
            return res.status(404).json({ message: 'No se encontraron alquileres' });
        }
        res.json(rents);
    } catch (error) {
        console.error('Error al obtener alquileres:', error);
        res.status(500).json({ message: 'Ocurrió un error al obtener los alquileres' });
    }
};

exports.getRentId = async (req, res) => {
    try {
        const rent = await ModelRent.findById(req.params.id).populate('CustomerId');
        if (!rent) {
            return res.status(404).json({ message: 'Alquiler no encontrado' });
        }
        res.json(rent);
    } catch (error) {
        console.error('Error al obtener el alquiler:', error);
        res.status(500).json({ message: 'Ocurrió un error al obtener el alquiler' });
    }
};

exports.createRent = async (req, res) => {
    try {
        const {
            LocationActivity,
            ActivityDate,
            DeliverDate,
            ReturnDate,
            Description,
            State = 1,
            StatusConfirmation = 0,
            Discount = 0,
            IVA = 0,
            CustomerId,
            RentDetail
        } = req.body;

        if (!LocationActivity || !ActivityDate || !DeliverDate || !ReturnDate || !CustomerId || !RentDetail || RentDetail.length === 0) {
            return res.status(400).json({ message: 'Faltan campos obligatorios para crear el alquiler. Asegúrate de proporcionar todos los campos requeridos.' });
        }

        if (!mongoose.Types.ObjectId.isValid(CustomerId)) {
            return res.status(400).json({ message: 'El ID del cliente proporcionado no es válido' });
        }

        const customer = await ModelCustomer.findById(CustomerId);
        if (!customer) {
            return res.status(404).json({ message: `El cliente con el ID ${CustomerId} proporcionado no existe` });
        }

        let Subtotal = 0;
        for (const item of RentDetail) {
            if (!mongoose.Types.ObjectId.isValid(item.itemId)) {
                return res.status(400).json({ message: `El ID del enser ${item.itemId} proporcionado no es válido` });
            }

            const itemData = await ModelItem.findById(item.itemId);
            if (!itemData) {
                return res.status(404).json({ message: `El enser con el ID ${item.itemId} no existe` });
            }

            if (!itemData.RentalPrice) {
                return res.status(400).json({ message: `El elemento con el ID ${item.itemId} no tiene un precio de alquiler definido` });
            }

            if (item.quantity > itemData.Quantity) {
                return res.status(400).json({ message: `La cantidad a rentar del elemento con el ID ${item.itemId} excede la cantidad disponible` });
            }

            item.price = itemData.RentalPrice * item.quantity;
            Subtotal += item.price;

            itemData.Quantity -= item.quantity;
            await itemData.save();
        }

        const Total = Subtotal - Discount + (Subtotal * (IVA / 100));

        const rentData = {
            LocationActivity,
            ActivityDate,
            DeliverDate,
            ReturnDate,
            State,
            StatusConfirmation,
            Subtotal,
            Discount,
            IVA,
            Total,
            CustomerId,
            RentDetail
        };

        if (Description) {
            rentData.Description = Description;
        }

        const rent = new ModelRent(rentData);

        const newRent = await rent.save();
        res.status(201).json(newRent);
    } catch (error) {
        console.error('Ocurrió un error al crear el alquiler:', error);
        if (error instanceof mongoose.Error.CastError) {
            return res.status(400).json({ message: 'Ocurrió un error al procesar los datos proporcionados' });
        }
        res.status(400).json({ message: 'Ocurrió un error al crear el alquiler', error: error.message });
    }
};

// exports.updateRent = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const { LocationActivity, ActivityDate, DeliverDate, ReturnDate, State, StatusConfirmation, RentDetail, CustomerId } = req.body;

//         if (!mongoose.Types.ObjectId.isValid(id)) {
//             return res.status(400).json({ message: 'El ID de la renta proporcionado no es válido' });
//         }

//         if (State !== undefined && ![0, 1].includes(State)) {
//             return res.status(400).json({ message: 'El campo State solo permite valores 0 o 1' });
//         }

//         if (StatusConfirmation !== undefined && ![0, 1, 2].includes(StatusConfirmation)) {
//             return res.status(400).json({ message: 'El campo StatusConfirmation solo permite valores 0, 1 o 2' });
//         }

//         const rent = await ModelRent.findById(id);
//         if (!rent) {
//             return res.status(404).json({ message: `La renta con el ID ${id} no existe` });
//         }

//         if (LocationActivity !== undefined) {
//             rent.LocationActivity = LocationActivity;
//         }
//         if (ActivityDate !== undefined) {
//             rent.ActivityDate = ActivityDate;
//         }
//         if (DeliverDate !== undefined) {
//             rent.DeliverDate = DeliverDate;
//         }
//         if (ReturnDate !== undefined) {
//             rent.ReturnDate = ReturnDate;
//         }

//         if (CustomerId !== undefined) {
//             if (!mongoose.Types.ObjectId.isValid(CustomerId)) {
//                 return res.status(400).json({ message: 'El ID del cliente proporcionado no es válido' });
//             }
//             const customerExists = await ModelCustomer.exists({ _id: CustomerId });
//             if (!customerExists) {
//                 return res.status(400).json({ message: 'El cliente proporcionado no existe' });
//             }
//             rent.CustomerId = CustomerId;
//         }

//         if (RentDetail) {
//             for (const item of RentDetail) {
//                 if (!mongoose.Types.ObjectId.isValid(item.itemId)) {
//                     return res.status(400).json({ message: `El ID del elemento ${item.itemId} proporcionado no es válido` });
//                 }
//                 const itemData = await ModelItem.findById(item.itemId);
//                 if (!itemData) {
//                     return res.status(404).json({ message: `El elemento con el ID ${item.itemId} no existe` });
//                 }
//             }
//         }

//         if (State !== undefined) {
//             if (rent.State === 0 && State === 1) {
//                 for (const item of rent.RentDetail) {
//                     const itemData = await ModelItem.findById(item.itemId);
//                     if (itemData) {
//                         itemData.Quantity -= item.quantity;
//                         await itemData.save();
//                     }
//                 }
//             } else if (rent.State === 1 && State === 0) {
//                 for (const item of rent.RentDetail) {
//                     const itemData = await ModelItem.findById(item.itemId);
//                     if (itemData) {
//                         itemData.Quantity += item.quantity;
//                         await itemData.save();
//                     }
//                 }
//             }
//             rent.State = State;
//         }

//         if (StatusConfirmation !== undefined) {
//             rent.StatusConfirmation = StatusConfirmation;
//         }

//         if (RentDetail) {
//             for (const newItem of RentDetail) {
//                 const existingItem = rent.RentDetail.find(item => item.itemId.equals(newItem.itemId));
//                 if (existingItem) {
//                     if (existingItem.quantity !== newItem.quantity && rent.State === 1) {
//                         const itemData = await ModelItem.findById(existingItem.itemId);
//                         if (itemData) {
//                             itemData.Quantity -= newItem.quantity - existingItem.quantity;
//                             await itemData.save();
//                         }
//                     }
//                     existingItem.quantity = newItem.quantity;
//                     existingItem.price = newItem.quantity * (await ModelItem.findById(existingItem.itemId)).RentalPrice;
//                 } else {
//                     newItem.price = newItem.quantity * (await ModelItem.findById(newItem.itemId)).RentalPrice;
//                     rent.RentDetail.push(newItem);
//                 }
//             }
//         }

//         rent.Subtotal = rent.RentDetail.reduce((total, item) => total + item.price, 0);
//         rent.Total = rent.Subtotal - rent.Discount + rent.Subtotal * (rent.IVA / 100);

//         const updatedRent = await rent.save();
//         res.json(updatedRent);
//     } catch (error) {
//         console.error('Ocurrió un error al actualizar la renta:', error);
//         if (error instanceof mongoose.Error.CastError) {
//             return res.status(400).json({ message: 'Ocurrió un error al procesar los datos proporcionados' });
//         }
//         res.status(400).json({ message: 'Ocurrió un error al actualizar la renta', error: error.message });
//     }
// };


exports.updateRent = async (req, res) => {
    try {
        const { id } = req.params;
        const { LocationActivity, ActivityDate, DeliverDate, ReturnDate, State, RentDetail, CustomerId, Discount, Description } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'El ID de la renta proporcionado no es válido' });
        }

        if (State !== undefined && ![0, 1, 2, 3, 4].includes(State)) {
            return res.status(400).json({ message: 'El campo State solo permite valores 0, 1, 2, 3 o 4' });
        }

        const rent = await ModelRent.findById(id);
        if (!rent) {
            return res.status(404).json({ message: `La renta con el ID ${id} no existe` });
        }

        if (LocationActivity !== undefined) rent.LocationActivity = LocationActivity;
        if (ActivityDate !== undefined) rent.ActivityDate = ActivityDate;
        if (DeliverDate !== undefined) rent.DeliverDate = DeliverDate;
        if (ReturnDate !== undefined) rent.ReturnDate = ReturnDate;
        if (Description !== undefined) rent.Description = Description;

        if (CustomerId !== undefined) {
            if (!mongoose.Types.ObjectId.isValid(CustomerId)) {
                return res.status(400).json({ message: 'El ID del cliente proporcionado no es válido' });
            }
            const customerExists = await ModelCustomer.exists({ _id: CustomerId });
            if (!customerExists) {
                return res.status(400).json({ message: 'El cliente proporcionado no existe' });
            }
            rent.CustomerId = CustomerId;
        }

        if (RentDetail) {
            for (const item of RentDetail) {
                if (!mongoose.Types.ObjectId.isValid(item.itemId)) {
                    return res.status(400).json({ message: `El ID del elemento ${item.itemId} proporcionado no es válido` });
                }
                const itemData = await ModelItem.findById(item.itemId);
                if (!itemData) {
                    return res.status(404).json({ message: `El elemento con el ID ${item.itemId} no existe` });
                }
            }
        }

        const validTransitions = {
            0: [1, 2, 3, 4],
            1: [0, 2, 3, 4],
            2: [0, 1, 3, 4],
            3: [0, 1, 2, 4],
            4: [0, 1, 2, 3]
        };

        if (State !== undefined && !validTransitions[rent.State].includes(State)) {
            return res.status(400).json({ message: `Transición de estado no permitida de ${rent.State} a ${State}` });
        }

        if (State !== undefined && State !== rent.State) {
            if (rent.State === 1 && [3, 4].includes(State)) {
                for (const item of rent.RentDetail) {
                    const itemData = await ModelItem.findById(item.itemId);
                    if (itemData) {
                        itemData.Quantity += item.quantity;
                        await itemData.save();
                    }
                }
            } else if ([0, 2].includes(rent.State) && State === 1) {
                for (const item of rent.RentDetail) {
                    const itemData = await ModelItem.findById(item.itemId);
                    if (itemData) {
                        itemData.Quantity -= item.quantity;
                        await itemData.save();
                    }
                }
            } else if (rent.State === 1 && [0, 2].includes(State)) {
                for (const item of rent.RentDetail) {
                    const itemData = await ModelItem.findById(item.itemId);
                    if (itemData) {
                        itemData.Quantity += item.quantity;
                        await itemData.save();
                    }
                }
            } else if ([3, 4].includes(rent.State) && State === 1) {
                for (const item of rent.RentDetail) {
                    const itemData = await ModelItem.findById(item.itemId);
                    if (itemData) {
                        itemData.Quantity -= item.quantity;
                        await itemData.save();
                    }
                }
            }
            rent.State = State;
        }

        if (RentDetail) {
            const currentItems = rent.RentDetail.map(item => item.itemId.toString());
            const newItems = RentDetail.map(item => item.itemId.toString());
            const itemsToRemove = currentItems.filter(id => !newItems.includes(id));

            for (const id of itemsToRemove) {
                const itemToRemove = rent.RentDetail.find(item => item.itemId.toString() === id);
                const itemData = await ModelItem.findById(itemToRemove.itemId);
                if (itemData) {
                    itemData.Quantity += itemToRemove.quantity;
                    await itemData.save();
                }
            }

            rent.RentDetail = rent.RentDetail.filter(item => !itemsToRemove.includes(item.itemId.toString()));

            for (const newItem of RentDetail) {
                const existingItem = rent.RentDetail.find(item => item.itemId.equals(newItem.itemId));
                if (existingItem) {
                    const itemData = await ModelItem.findById(existingItem.itemId);
                    if (itemData) {
                        const quantityDifference = newItem.quantity - existingItem.quantity;
                        if (quantityDifference > 0 && rent.State === 1) {
                            itemData.Quantity -= quantityDifference;
                            await itemData.save();
                        }
                        existingItem.quantity = newItem.quantity;
                        existingItem.price = newItem.quantity * itemData.RentalPrice;
                    }
                } else {
                    const itemData = await ModelItem.findById(newItem.itemId);
                    if (itemData) {
                        newItem.price = newItem.quantity * itemData.RentalPrice;
                        rent.RentDetail.push(newItem);
                        if (rent.State === 1) {
                            itemData.Quantity -= newItem.quantity;
                            await itemData.save();
                        }
                    }
                }
            }
        }

        if (Discount !== undefined) {
            rent.Discount = Discount;
        }

        rent.Subtotal = rent.RentDetail.reduce((total, item) => total + item.price, 0);
        rent.Total = rent.Subtotal - (rent.Discount || 0) + rent.Subtotal * (rent.IVA / 100);

        const updatedRent = await rent.save();
        res.json(updatedRent);
    } catch (error) {
        console.error('Ocurrió un error al actualizar la renta:', error);
        if (error instanceof mongoose.Error.CastError) {
            return res.status(400).json({ message: 'Ocurrió un error al procesar los datos proporcionados' });
        }
        res.status(400).json({ message: 'Ocurrió un error al actualizar la renta', error: error.message });
    }
};

exports.deleteRent = async (req, res) => {
    try {
        const rent = await ModelRent.findById(req.params.id);

        if (!rent) {
            return res.status(404).json({ message: 'Alquiler no encontrado' });
        }
        // if (rent.State === 1) {
        //     return res.status(400).json({ message: 'No se puede eliminar un alquiler con estado "Aceptada" (1)' });
        // }
        await rent.deleteOne();
        res.json({ message: 'Alquiler eliminado exitosamente' });
    } catch (error) {
        console.error('Error al eliminar el alquiler:', error);
        res.status(500).json({ message: 'Ocurrió un error al eliminar el alquiler' });
    }
};











