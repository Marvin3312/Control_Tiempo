import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import './UnifiedForm.css';

// Hook para obtener datos para los selects
const useSelectData = (dataType) => {
    const [data, setData] = useState([]);
    useEffect(() => {
        const fetchData = async () => {
            if (!dataType) return;
            const { data: result, error } = await supabase.from(dataType).select('*');
            if (error) {
                console.error(`Error fetching ${dataType}:`, error);
            } else {
                setData(result);
            }
        };
        fetchData();
    }, [dataType]);
    return data;
};

export default function UnifiedForm({ formType, onSubmit, initialData = {} }) {
    const [formData, setFormData] = useState(initialData);

    const departamentos = useSelectData('departamentos');
    const clientes = useSelectData('clientes');
    const puestos = useSelectData('puestos'); // Añadido para obtener datos de puestos

    useEffect(() => {
        setFormData(initialData);
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    const formConfigs = {
        client: {
            title: 'Datos del Cliente',
            fields: [
                { name: 'nombrecliente', label: 'Nombre del Cliente', type: 'text', required: true },
                { name: 'parentclienteid', label: 'ID Cliente Padre (Opcional)', type: 'number' },
                { name: 'activo', label: 'Activo', type: 'checkbox' },
            ]
        },
        project: {
            title: 'Datos del Proyecto',
            fields: [
                { name: 'nombreproyecto', label: 'Nombre del Proyecto', type: 'text', required: true },
                { name: 'referenciacaseware', label: 'Código Caseware', type: 'text' },
                { name: 'clienteid', label: 'Cliente', type: 'select', options: clientes, optionValue: 'clienteid', optionLabel: 'nombrecliente', required: true },
                { name: 'activo', label: 'Activo', type: 'checkbox' },
            ]
        },
        employee: {
            title: 'Datos del Empleado',
            fields: [
                { name: 'nombrecompleto', label: 'Nombre Completo', type: 'text', required: true },
                { name: 'puestoid', label: 'Puesto', type: 'select', options: puestos, optionValue: 'puestoid', optionLabel: 'nombrepuesto', required: true },
                { name: 'departamentoid', label: 'Departamento', type: 'select', options: departamentos, optionValue: 'departamentoid', optionLabel: 'nombredepto', required: true },
                { name: 'activo', label: 'Activo', type: 'checkbox' },
            ]
        }
    };

    const currentConfig = formConfigs[formType];

    if (!currentConfig) {
        return <p>Tipo de formulario no reconocido.</p>;
    }

    return (
        <form onSubmit={handleSubmit} className="unified-form">
            <h5>{currentConfig.title}</h5>
            {currentConfig.fields.map(field => {
                const { name, label, type, required, options, optionValue, optionLabel } = field;
                const value = formData[name] || '';

                if (type === 'select') {
                    return (
                        <div className="mb-3" key={name}>
                            <label htmlFor={name} className="form-label">{label}</label>
                            <select
                                className="form-control"
                                id={name}
                                name={name}
                                value={value}
                                onChange={handleChange}
                                required={required}
                            >
                                <option value="" disabled>Seleccione una opción</option>
                                {options?.map(option => (
                                    <option key={option[optionValue]} value={option[optionValue]}>
                                        {option[optionLabel]}
                                    </option>
                                ))}
                            </select>
                        </div>
                    );
                }

                if (type === 'checkbox') {
                    return (
                        <div className="form-check mb-3" key={name}>
                            <input
                                className="form-check-input"
                                type="checkbox"
                                id={name}
                                name={name}
                                checked={!!formData[name]}
                                onChange={handleChange}
                            />
                            <label className="form-check-label" htmlFor={name}>
                                {label}
                            </label>
                        </div>
                    );
                }

                return (
                    <div className="mb-3" key={name}>
                        <label htmlFor={name} className="form-label">{label}</label>
                        <input
                            type={type}
                            className="form-control"
                            id={name}
                            name={name}
                            value={value}
                            onChange={handleChange}
                            required={required}
                        />
                    </div>
                );
            })}
            <button type="submit" className="btn btn-primary mt-3">Guardar</button>
        </form>
    );
}