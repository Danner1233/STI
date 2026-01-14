import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import Autocheck from "./Autocheck";
import {
  Copy,
  Send,
  Download,
  Calendar,
  TrendingUp,
  CheckCircle,
  Clock,
  Upload,
  FileArchive,
  Mail,
  Settings,
} from "lucide-react";

const AgendamientoOT = () => {
  const [formData, setFormData] = useState({
    numeroOT: "",
    cliente: "",
    ciudad: "",
    direccion: "",
    fecha: "",
    hora: "",
    correoDestino: "",
    contacto: "",
    telefono: "",
    tipoServicio: "ENTREGA DE SERVICIO",
    observaciones: "",
    duracion: "4-8 horas",
    consensus: true, // Checkbox para Consensus
    tablaPersonalizada: "", // HTML de tabla pegada desde Excel
    copiaCC: [], // Array de correos en copia
  });

  // Sistema de correos en copia (CC)
  const [contactosGuardados, setContactosGuardados] = useState(() => {
    const saved = localStorage.getItem('contactos-guardados');
    return saved ? JSON.parse(saved) : [
      { nombre: 'Santiago Cornejo', email: 'santiago.cornejo@sti.com.co' },
      { nombre: 'Danner Arias', email: 'danner.arias@sti.com.co' },
      { nombre: 'Carlos Rodriguez', email: 'carlos.rodriguez@sti.com.co' },
      { nombre: 'Maria Lopez', email: 'maria.lopez@sti.com.co' },
    ];
  });

  const [inputCC, setInputCC] = useState('');
  const [sugerenciasCC, setSugerenciasCC] = useState([]);

  // Parafiscales mensuales
  const [parafiscalesMensuales, setParafiscalesMensuales] = useState(() => {
    const saved = localStorage.getItem('parafiscales-mensuales');
    return saved ? JSON.parse(saved) : {
      mes: new Date().toISOString().slice(0, 7), // YYYY-MM
      tecnicos: [
        {
          nombre: "DANIEL JARAMILLO BETANCUR",
          cedula: "10.050.343",
          eps: "SO S SERVICIO OCCIDENTAL DE SALUD S A",
          arl: "COLPATRIA ARL"
        },
        {
          nombre: "SERAFIN ALEXANDER GUTIERREZ GAMBOA",
          cedula: "1.012.382.666",
          eps: "FAMISANAR",
          arl: "COLPATRIA ARL"
        },
        {
          nombre: "JORGE ANDRES VELEZ BETANCUR",
          cedula: "1.088.313.500",
          eps: "SANITAS",
          arl: "COLPATRIA ARL"
        },
        {
          nombre: "VICTOR MANUEL VELASQUEZ CARDENAS",
          cedula: "1.096.007.383",
          eps: "EPS SURA JANTES SUSALUD",
          arl: "COLPATRIA ARL"
        },
        {
          nombre: "WILSON EDUARDO CASTAÑEDA PULIDO",
          cedula: "80.183.038",
          eps: "EPS SURA",
          arl: "COLPATRIA ARL"
        }
      ]
    };
  });

  const [mostrarParafiscalesMensuales, setMostrarParafiscalesMensuales] = useState(false);
  
  const [mostrarHistorial, setMostrarHistorial] = useState(false);
  const [busquedaHistorial, setBusquedaHistorial] = useState("");

  // Estado para mostrar/ocultar Autocheck
  const [mostrarAutocheck, setMostrarAutocheck] = useState(false);
  const [mostrarGestionContactos, setMostrarGestionContactos] = useState(false);
  const [mostrarSelectorMultiple, setMostrarSelectorMultiple] = useState(false);
  const [contactosSeleccionados, setContactosSeleccionados] = useState([]);

  const [archivoZip, setArchivoZip] = useState(null);
  const [copied, setCopied] = useState(false);
  const [registrado, setRegistrado] = useState(false);
  const [mostrarConfigZoho, setMostrarConfigZoho] = useState(false);

  const [zohoConfig, setZohoConfig] = useState(() => {
    const saved = localStorage.getItem("zoho-config");
    return saved
      ? JSON.parse(saved)
      : {
          email: "",
          password: "",
          fromEmail: "agendamiento@sti.com.co",
          // Credenciales API (opcionales, solo para sincronizar contactos)
          clientId: "",
          clientSecret: "",
          refreshToken: "",
        };
  });

  const [productividad, setProductividad] = useState(() => {
    const saved = localStorage.getItem("productividad-ot");
    return saved ? JSON.parse(saved) : [];
  });

  // Guardar contactos guardados
  useEffect(() => {
    localStorage.setItem('contactos-guardados', JSON.stringify(contactosGuardados));
  }, [contactosGuardados]);

  // Guardar parafiscales mensuales
  useEffect(() => {
    localStorage.setItem('parafiscales-mensuales', JSON.stringify(parafiscalesMensuales));
  }, [parafiscalesMensuales]);

  // Guardar productividad en localStorage
  useEffect(() => {
    localStorage.setItem("productividad-ot", JSON.stringify(productividad));
  }, [productividad]);

  // Guardar configuración de Zoho
  useEffect(() => {
    localStorage.setItem("zoho-config", JSON.stringify(zohoConfig));
  }, [zohoConfig]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };


  // Funciones para el sistema de CC (copia)
  const handleInputCCChange = (e) => {
    const value = e.target.value;
    setInputCC(value);

    // Filtrar sugerencias por nombre o email
    if (value.length > 0) {
      const sugerencias = contactosGuardados.filter(contacto => {
        const nombreMatch = contacto.nombre.toLowerCase().includes(value.toLowerCase());
        const emailMatch = contacto.email.toLowerCase().includes(value.toLowerCase());
        const yaAgregado = formData.copiaCC.some(cc => cc.email === contacto.email);
        
        return (nombreMatch || emailMatch) && !yaAgregado;
      });
      setSugerenciasCC(sugerencias);
    } else {
      setSugerenciasCC([]);
    }
  };

  const agregarCC = (contacto) => {
    // Si es un objeto (de sugerencias)
    if (contacto.email) {
      if (!formData.copiaCC.some(cc => cc.email === contacto.email)) {
        setFormData(prev => ({
          ...prev,
          copiaCC: [...prev.copiaCC, contacto]
        }));
      }
    } 
    // Si es un string (email directo)
    else if (typeof contacto === 'string' && contacto.includes('@')) {
      const nuevoContacto = {
        nombre: contacto.split('@')[0],
        email: contacto
      };
      
      if (!formData.copiaCC.some(cc => cc.email === nuevoContacto.email)) {
        setFormData(prev => ({
          ...prev,
          copiaCC: [...prev.copiaCC, nuevoContacto]
        }));

        // Agregar a contactos guardados si es nuevo
        if (!contactosGuardados.some(c => c.email === nuevoContacto.email)) {
          setContactosGuardados(prev => [...prev, nuevoContacto]);
        }
      }
    }
    
    setInputCC('');
    setSugerenciasCC([]);
  };

  const handleKeyDownCC = (e) => {
    if (e.key === 'Enter' && inputCC.trim()) {
      e.preventDefault();
      
      // Si hay sugerencias, usar la primera
      if (sugerenciasCC.length > 0) {
        agregarCC(sugerenciasCC[0]);
      } 
      // Si no, agregar como email directo
      else if (inputCC.includes('@')) {
        agregarCC(inputCC.trim());
      }
    }
  };

  const eliminarCC = (emailAEliminar) => {
    setFormData(prev => ({
      ...prev,
      copiaCC: prev.copiaCC.filter(cc => cc.email !== emailAEliminar)
    }));
  };

  // Función para agregar técnico a parafiscales mensuales
  const agregarTecnicoMensual = () => {
    const nuevoTecnico = {
      nombre: "",
      cedula: "",
      eps: "",
      arl: ""
    };
    
    setParafiscalesMensuales(prev => ({
      ...prev,
      tecnicos: [...prev.tecnicos, nuevoTecnico]
    }));
  };

  const actualizarTecnicoMensual = (index, campo, valor) => {
    setParafiscalesMensuales(prev => ({
      ...prev,
      tecnicos: prev.tecnicos.map((tec, i) => 
        i === index ? { ...tec, [campo]: valor } : tec
      )
    }));
  };

  const eliminarTecnicoMensual = (index) => {
    setParafiscalesMensuales(prev => ({
      ...prev,
      tecnicos: prev.tecnicos.filter((_, i) => i !== index)
    }));
  };

  const actualizarMesParafiscales = (nuevoMes) => {
    setParafiscalesMensuales(prev => ({
      ...prev,
      mes: nuevoMes
    }));
  };

  // Funciones para gestionar contactos guardados
  const agregarNuevoContacto = () => {
    const nuevoContacto = {
      nombre: "",
      email: ""
    };
    setContactosGuardados(prev => [...prev, nuevoContacto]);
  };

  const actualizarContacto = (index, campo, valor) => {
    setContactosGuardados(prev => 
      prev.map((contacto, i) => 
        i === index ? { ...contacto, [campo]: valor } : contacto
      )
    );
  };

  const eliminarContacto = (index) => {
    setContactosGuardados(prev => prev.filter((_, i) => i !== index));
  };

  // Importar parafiscales desde Excel
  const importarParafiscalesExcel = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Verificar que sea un archivo Excel
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      alert('⚠️ Por favor selecciona un archivo Excel (.xlsx o .xls)');
      return;
    }

    try {
      // Cargar la librería XLSX dinámicamente desde CDN
      if (!window.XLSX) {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
        document.head.appendChild(script);
        
        await new Promise((resolve) => {
          script.onload = resolve;
        });
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = new Uint8Array(event.target.result);
          const workbook = window.XLSX.read(data, { type: 'array' });
          
          // Leer la primera hoja
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          
          // Convertir a JSON
          const jsonData = window.XLSX.utils.sheet_to_json(worksheet);

          if (jsonData.length === 0) {
            alert('⚠️ El archivo está vacío o no tiene datos válidos.');
            return;
          }

          // Mapear los datos al formato que necesitamos
          const nuevosTecnicos = jsonData.map(row => ({
            nombre: row['Nombre'] || row['NOMBRE'] || row['nombre'] || '',
            cedula: row['Cédula'] || row['Cedula'] || row['CEDULA'] || row['cedula'] || '',
            eps: row['EPS'] || row['eps'] || '',
            arl: row['ARL'] || row['arl'] || ''
          }));

          // Actualizar el estado
          setParafiscalesMensuales(prev => ({
            ...prev,
            tecnicos: nuevosTecnicos
          }));

          alert(`✅ ${nuevosTecnicos.length} técnicos importados exitosamente desde Excel!`);
          
        } catch (error) {
          console.error('Error al procesar Excel:', error);
          alert('❌ Error al leer el archivo Excel. Asegúrate de que tenga las columnas: Nombre, Cédula, EPS, ARL');
        }
      };

      reader.readAsArrayBuffer(file);
      
    } catch (error) {
      console.error('Error:', error);
      alert('❌ Error al cargar la librería de Excel');
    }
    
    e.target.value = ''; // Reset input
  };

  // Importar contactos directamente desde Zoho API
  const sincronizarContactosZoho = async () => {
    if (!zohoConfig.clientId || !zohoConfig.clientSecret || !zohoConfig.refreshToken) {
      alert('⚠️ Primero configura tus credenciales OAuth de Zoho en "Configuración Zoho"');
      setMostrarConfigZoho(true);
      return;
    }

    const confirmacion = window.confirm(
      '¿Importar TODOS tus contactos de Zoho?\n\n' +
      'Esto traerá automáticamente todos los contactos de tu cuenta de Zoho. ' +
      'Puede tomar unos segundos dependiendo de cuántos contactos tengas.'
    );

    if (!confirmacion) return;

    try {
      alert('📇 Importando contactos de Zoho...\nEsto puede tomar unos segundos.');

      const response = await fetch('http://localhost:3001/api/get-zoho-contacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientId: zohoConfig.clientId,
          clientSecret: zohoConfig.clientSecret,
          refreshToken: zohoConfig.refreshToken,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al obtener contactos');
      }

      const data = await response.json();
      
      if (data.success && data.contacts && data.contacts.length > 0) {
        // Agregar solo contactos nuevos
        const contactosNuevos = data.contacts.filter(
          newContact => !contactosGuardados.some(existing => existing.email === newContact.email)
        );

        if (contactosNuevos.length > 0) {
          setContactosGuardados(prev => [...prev, ...contactosNuevos]);
          alert(`✅ ¡Éxito! Se importaron ${contactosNuevos.length} contactos nuevos de Zoho.\n\nTotal de contactos: ${contactosGuardados.length + contactosNuevos.length}`);
        } else {
          alert('ℹ️ Todos los contactos de Zoho ya están importados.');
        }
      } else {
        alert('⚠️ No se encontraron contactos en tu cuenta de Zoho.');
      }

    } catch (error) {
      console.error('Error al importar contactos:', error);
      alert(`❌ Error al importar contactos de Zoho:\n\n${error.message}\n\nAsegúrate de que:\n1. El backend esté corriendo\n2. Tus credenciales OAuth estén configuradas\n3. Tu Refresh Token tenga el scope: ZohoContacts.userapi.READ`);
    }
  };

  // Agregar múltiples contactos seleccionados a CC
  const agregarMultiplesCC = (contactosSeleccionados) => {
    const nuevosCC = contactosSeleccionados.filter(
      contacto => !formData.copiaCC.some(cc => cc.email === contacto.email)
    );
    
    if (nuevosCC.length > 0) {
      setFormData(prev => ({
        ...prev,
        copiaCC: [...prev.copiaCC, ...nuevosCC]
      }));
    }
  };

  const handleZohoConfigChange = (e) => {
    const { name, value } = e.target;
    setZohoConfig((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleArchivoZip = (e) => {
    const file = e.target.files[0];
    if (file && file.name.endsWith(".zip")) {
      setArchivoZip(file);
    } else {
      alert("Por favor selecciona un archivo .zip");
      e.target.value = "";
    }
  };

  const generarAsunto = () => {
    return `CLARO COLOMBIA ENTREGA DE SERVICIO-${formData.cliente.toUpperCase()}- OT ${
      formData.numeroOT
    }`;
  };

  const generarCuerpo = () => {
    const dias = [
      "Domingo",
      "Lunes",
      "Martes",
      "Miercoles",
      "Jueves",
      "Viernes",
      "Sabado",
    ];
    const meses = [
      "enero",
      "febrero",
      "marzo",
      "abril",
      "mayo",
      "junio",
      "julio",
      "agosto",
      "septiembre",
      "octubre",
      "noviembre",
      "diciembre",
    ];

    let fechaFormateada = "";
    if (formData.fecha) {
      const fecha = new Date(formData.fecha + "T00:00:00");
      const diaSemana = dias[fecha.getDay()];
      const dia = fecha.getDate();
      const mes = meses[fecha.getMonth()];
      const año = fecha.getFullYear();
      fechaFormateada = `${diaSemana} ${dia} de ${mes} de ${año}`;
    }

    return `Buen dia

Señores

${formData.cliente.toUpperCase()}

Queremos confirmarle la actividad de ${formData.tipoServicio.toUpperCase()} para la sede relacionada en el cuadro. Le solicitamos permisos de ingreso tanto administrativos como tecnicos para el ingreso a la sede en mencion.
se requiere de un acompañamiento para realizar pruebas pertinentes

Duracion de la actividad:  ${formData.duracion}

┌─────────────────────────────────────────────────────────────────────┐
│ OT            FECHA           HORA      CIUDAD      DIRECCION       │
├─────────────────────────────────────────────────────────────────────┤
│ ${formData.numeroOT.padEnd(13)} ${fechaFormateada.padEnd(15)} ${formData.hora.padEnd(11)} ${formData.ciudad.padEnd(11)} ${formData.direccion.padEnd(15)} │
└─────────────────────────────────────────────────────────────────────┘

Consideramos oportuno recordarle que para que esta obra pueda completarse es necesario solicitar acompañamiento por parte del personal de mantenimiento de las instalaciones. De la misma forma, quisieramos pec
celular de la persona de contacto en sitio. Esto nos sera muy util para estar en contacto con el.


PARAFISCALES DE LOS TECNICOS:
${parafiscalesMensuales.tecnicos.map(tec => 
  `${String(tec.nombre || '').padEnd(35)} CC: ${String(tec.cedula || '').padEnd(15)} EPS: ${String(tec.eps || '').padEnd(20)} ARL: ${String(tec.arl || '')}`
).join('\n')}
`;
  };

  const generarCuerpoHTML = () => {
    const dias = [
      "Domingo",
      "Lunes",
      "Martes",
      "Miercoles",
      "Jueves",
      "Viernes",
      "Sabado",
    ];
    const meses = [
      "enero",
      "febrero",
      "marzo",
      "abril",
      "mayo",
      "junio",
      "julio",
      "agosto",
      "septiembre",
      "octubre",
      "noviembre",
      "diciembre",
    ];

    let fechaFormateada = "";
    if (formData.fecha) {
      const fecha = new Date(formData.fecha + "T00:00:00");
      const diaSemana = dias[fecha.getDay()];
      const dia = fecha.getDate();
      const mes = meses[fecha.getMonth()];
      const año = fecha.getFullYear();
      fechaFormateada = `${diaSemana} ${dia} de ${mes} de ${año}`;
    }

    return `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
        <p>Buen dia</p>
        <p>Señores</p>
        <p><strong>${formData.cliente.toUpperCase()}</strong></p>
        
        <p>Queremos confirmarle la actividad de <strong>${formData.tipoServicio.toUpperCase()}</strong> para la sede relacionada en el cuadro. Le solicitamos permisos de ingreso tanto administrativos como tecnicos para el ingreso a la sede en mencion.</p>
        <p>se requiere de un acompañamiento para realizar pruebas pertinentes</p>
        
        <p><strong>Duracion de la actividad:</strong> ${formData.duracion}</p>
        
        <table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse; width: 100%; margin: 20px 0;">
          <thead>
            <tr style="background-color: #e30613; color: white;">
              <th>OT</th>
              <th>FECHA</th>
              <th>HORA</th>
              <th>CIUDAD</th>
              <th>DIRECCION</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>${formData.numeroOT}</td>
              <td>${fechaFormateada}</td>
              <td>${formData.hora}</td>
              <td>${formData.ciudad}</td>
              <td>${formData.direccion}</td>
            </tr>
          </tbody>
        </table>
        
        <p>Consideramos oportuno recordarle que para que esta obra pueda completarse es necesario solicitar acompañamiento por parte del personal de mantenimiento de las instalaciones. De la misma forma, quisieramos pec celular de la persona de contacto en sitio. Esto nos sera muy util para estar en contacto con el.</p>
        
        ${formData.tablaPersonalizada ? 
          // Si hay tabla personalizada, usarla
          formData.tablaPersonalizada
        : 
          // Si no, usar la tabla mensual de parafiscales
          `<table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse; width: 100%; margin: 20px 0;">
          <thead>
            <tr style="background-color: #e30613; color: white;">
              <th>Nombre</th>
              <th>Cedula</th>
              <th>EPS</th>
              <th>ARL</th>
            </tr>
          </thead>
          <tbody>
            ${parafiscalesMensuales.tecnicos.map(tec => `
              <tr>
                <td>${tec.nombre}</td>
                <td>${tec.cedula}</td>
                <td>${tec.eps}</td>
                <td>${tec.arl}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>`
        }

        <!-- FIRMA CORPORATIVA -->
        <div style="margin-top: 40px;">
          <p style="margin: 5px 0;"><strong>Cordialmente,</strong></p>
          <br>
          <div style="border-left: 4px solid #e30613; padding-left: 15px;">
            <p style="margin: 5px 0; font-weight: bold; color: #e30613;">Analista de Agendamientos Proyectos</p>
            <p style="margin: 5px 0; font-weight: bold; color: #e30613;">Danner Arias Munive</p>
            <p style="margin: 5px 0; color: #999;">CLARO Colombia</p>
            <br>
            <p style="margin: 5px 0; color: #666; font-size: 12px;">Conmutador: Call: 4896060, Medellin: 6051111, B/quilla: 3852323</p>
          </div>
          <br>
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-top: 20px;">
            <p style="margin: 5px 0; font-weight: bold; color: #e30613; font-size: 11px;">AVISO DE CONFIDENCIALIDAD:</p>
            <p style="margin: 5px 0; color: #666; font-size: 10px; line-height: 1.4;">
              Este correo electronico, incluyendo en su caso, los archivos adjuntos al mismo, pueden contener informacion de caracter confidencial y/o privilegiada, y se envian a la atencion unica y exclusivamente de la persona y/o entidad a quien va dirigido. La copia, revision, uso, revelacion y/o distribucion de dicha informacion confidencial sin la autorizacion por escrito de Telmex Colombia S.A esta prohibida. Si usted no es el destinatario o quien se dirige el presente correo, favor de contactar al remitente respondiendo al presente correo y eliminar el correo original incluyendo sus archivos, asi como cualquier copia del mismo. Mediante la recepcion del presente correo usted reconoce y acepta que en caso de incumplimiento de su parte y/o de sus representantes a los terminos antes mencionados, Telmex Colombia S.A tendra derecho a los daños y perjuicios que esto le cause.
            </p>
            <br>
            <p style="margin: 5px 0; font-weight: bold; color: #e30613; font-size: 11px;">CONFIDENTIALITY NOTICE:</p>
            <p style="margin: 5px 0; color: #666; font-size: 10px; line-height: 1.4;">
              This e-mail message including attachments, if any, is intended only for the person or entity to which it is addressed and may contain confidential and /or privileged material. Any review, use, disclosure or distribution of such confidential information without the written authorization of Telmex Colombia S.A is prohibited. If you are not the intended recipient, please contact the sender by reply e-mail and destroy all copies of the original message. By receiving this e-mail you acknowledge that any breach by you and/or your representatives of the above provisions may entitle Telmex Colombia S.A to seek for damages.
            </p>
          </div>
        </div>
      </div>
    `;
  };

  const copiarCorreo = () => {
    // Validar todos los campos obligatorios (excepto correoDestino)
    const camposFaltantes = [];
    
    if (!formData.numeroOT) camposFaltantes.push('Número OT');
    if (!formData.cliente) camposFaltantes.push('Cliente');
    if (!formData.ciudad) camposFaltantes.push('Ciudad');
    if (!formData.direccion) camposFaltantes.push('Dirección');
    if (!formData.fecha) camposFaltantes.push('Fecha');
    if (!formData.hora) camposFaltantes.push('Hora');
    if (!formData.duracion) camposFaltantes.push('Duración');
    
    if (camposFaltantes.length > 0) {
      alert(`⚠️ Por favor completa los siguientes campos obligatorios:\n\n• ${camposFaltantes.join('\n• ')}`);
      return;
    }

    const asunto = generarAsunto();
    const cuerpo = generarCuerpo();
    const textoCompleto = `ASUNTO:\n${asunto}\n\n${cuerpo}`;

    navigator.clipboard.writeText(textoCompleto).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };


  // Función para enviar correo con Zoho Mail SMTP a través del backend
  const enviarCorreoZoho = async () => {
    // Validar todos los campos obligatorios
    const camposFaltantes = [];
    
    if (!formData.numeroOT) camposFaltantes.push('Número OT');
    if (!formData.cliente) camposFaltantes.push('Cliente');
    if (!formData.ciudad) camposFaltantes.push('Ciudad');
    if (!formData.direccion) camposFaltantes.push('Dirección');
    if (!formData.fecha) camposFaltantes.push('Fecha');
    if (!formData.hora) camposFaltantes.push('Hora');
    if (!formData.duracion) camposFaltantes.push('Duración');
    if (!formData.correoDestino) camposFaltantes.push('Correo Destino');
    
    if (camposFaltantes.length > 0) {
      alert(`⚠️ Por favor completa los siguientes campos obligatorios:\n\n• ${camposFaltantes.join('\n• ')}`);
      return;
    }

    if (!zohoConfig.email || !zohoConfig.password) {
      alert(
        "Por favor configura primero tus credenciales SMTP de Zoho Mail en Configuracion"
      );
      setMostrarConfigZoho(true);
      return;
    }

    try {
      // Preparar el correo con CC
      const emailData = {
        fromAddress: zohoConfig.fromEmail || zohoConfig.email,
        toAddress: formData.correoDestino,
        cc: formData.copiaCC.map(c => c.email).join(', '), // Agregar CC
        subject: generarAsunto(),
        content: generarCuerpoHTML(),
      };

      // Si hay archivo ZIP, convertirlo a base64
      if (archivoZip) {
        const reader = new FileReader();
        reader.onload = async (e) => {
          const base64 = e.target.result.split(",")[1];
          emailData.attachments = [
            {
              attachmentName: archivoZip.name,
              content: base64,
            },
          ];

          await enviarCorreoConBackend(emailData);
        };
        reader.readAsDataURL(archivoZip);
      } else {
        await enviarCorreoConBackend(emailData);
      }
    } catch (error) {
      console.error("Error al enviar correo:", error);
      alert(
        "Error al enviar el correo. Verifica tus credenciales y que el backend esté corriendo."
      );
    }
  };

  const enviarCorreoConBackend = async (emailData) => {
    try {
      // Enviar al backend usando SMTP
      const response = await fetch("http://localhost:3001/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          smtpConfig: {
            email: zohoConfig.email,
            password: zohoConfig.password,
          },
          emailData: emailData,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al enviar el correo");
      }

      const data = await response.json();
      
      if (data.success) {
        alert("✓ Correo enviado exitosamente!");
        registrarEnvio();
      } else {
        throw new Error("Error desconocido al enviar el correo");
      }
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  };

  const registrarEnvio = () => {
    const nuevo = {
      id: Date.now(),
      numeroOT: formData.numeroOT,
      cliente: formData.cliente,
      ciudad: formData.ciudad,
      direccion: formData.direccion,
      fecha: formData.fecha,
      hora: formData.hora,
      fechaEnvio: new Date().toISOString(),
      estado: "Enviado",
      tipoServicio: formData.tipoServicio,
      consensus: formData.consensus,
      rr: "",
      // Guardar datos completos del correo para historial
      correoDestino: formData.correoDestino,
      contacto: formData.contacto,
      telefono: formData.telefono,
      duracion: formData.duracion,
      observaciones: formData.observaciones,
      tablaPersonalizada: formData.tablaPersonalizada,
      copiaCC: formData.copiaCC,
    };

    setProductividad((prev) => [nuevo, ...prev]);
    setRegistrado(true);
    setTimeout(() => setRegistrado(false), 2000);

    // Limpiar formulario
    setFormData({
      numeroOT: "",
      cliente: "",
      ciudad: "",
      direccion: "",
      fecha: "",
      hora: "",
      correoDestino: "",
      contacto: "",
      telefono: "",
      tipoServicio: "ENTREGA DE SERVICIO",
      observaciones: "",
      duracion: "4-8 horas",
      consensus: true,
      tablaPersonalizada: "",
      copiaCC: [],
    });
    setArchivoZip(null);
  };

  // Actualizar estado de una OT
  const actualizarEstadoOT = (id, nuevoEstado) => {
    setProductividad(prev => 
      prev.map(ot => 
        ot.id === id ? { ...ot, estado: nuevoEstado } : ot
      )
    );
  };

  // Actualizar RR de una OT
  const actualizarRR = (id, nuevoRR) => {
    setProductividad(prev => 
      prev.map(ot => 
        ot.id === id ? { ...ot, rr: nuevoRR } : ot
      )
    );
  };

  // Reutilizar datos de un correo anterior
  const reutilizarCorreo = (ot) => {
    setFormData({
      numeroOT: ot.numeroOT || "",
      cliente: ot.cliente || "",
      ciudad: ot.ciudad || "",
      direccion: ot.direccion || "",
      fecha: ot.fecha || "",
      hora: ot.hora || "",
      correoDestino: ot.correoDestino || "",
      contacto: ot.contacto || "",
      telefono: ot.telefono || "",
      tipoServicio: ot.tipoServicio || "ENTREGA DE SERVICIO",
      observaciones: ot.observaciones || "",
      duracion: ot.duracion || "4-8 horas",
      consensus: ot.consensus || true,
      tablaPersonalizada: ot.tablaPersonalizada || "",
      copiaCC: ot.copiaCC || [],
    });
    
    setMostrarHistorial(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    alert('✅ Datos cargados! Puedes modificar lo que necesites y enviar.');
  };

  // Verificar OTs pendientes y mostrar recordatorio
  useEffect(() => {
    const pendientes = productividad.filter(ot => ot.estado === "Pendiente");
    if (pendientes.length > 0) {
      // Mostrar recordatorio cada vez que se carga la app
      const timer = setTimeout(() => {
        const mensaje = `⏰ RECORDATORIO:\n\nTienes ${pendientes.length} OT(s) pendiente(s):\n\n${pendientes.map(ot => `• OT ${ot.numeroOT} - ${ot.cliente}`).join('\n')}\n\n¡No olvides hacer seguimiento!`;
        alert(mensaje);
      }, 2000); // 2 segundos después de cargar
      
      return () => clearTimeout(timer);
    }
  }, [productividad]);

  const calcularEstadisticas = () => {
    const hoy = new Date().toDateString();
    const inicioSemana = new Date();
    inicioSemana.setDate(inicioSemana.getDate() - inicioSemana.getDay());
    const inicioMes = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1
    );

    const hoyCount = productividad.filter(
      (ot) => new Date(ot.fechaEnvio).toDateString() === hoy
    ).length;

    const semanaCount = productividad.filter(
      (ot) => new Date(ot.fechaEnvio) >= inicioSemana
    ).length;

    const mesCount = productividad.filter(
      (ot) => new Date(ot.fechaEnvio) >= inicioMes
    ).length;

    return { hoyCount, semanaCount, mesCount };
  };

  const exportarExcel = () => {
    // Función para quitar tildes
    const quitarTildes = (str) => {
      if (!str) return "";
      return str
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        // eslint-disable-next-line no-control-regex
        .replace(/[^\u0020-\u007E]/g, "");
    };

    // Preparar datos para la tabla principal
    const datosTabla = productividad.map((ot) => ({
      "Numero OT": quitarTildes(ot.numeroOT || ""),
      "RR": quitarTildes(ot.rr || ""),
      "Cliente": quitarTildes(ot.cliente || ""),
      "Ciudad": quitarTildes(ot.ciudad || ""),
      "Direccion": quitarTildes(ot.direccion || ""),
      "Fecha Agendada": ot.fecha || "",
      "Fecha Envio": new Date(ot.fechaEnvio).toLocaleDateString("es-CO"),
      "Estado": quitarTildes(ot.estado || ""),
      "Tipo Servicio": quitarTildes(ot.tipoServicio || ""),
      "Consensus": ot.consensus ? "SI" : "NO",
    }));

    // Crear libro de trabajo
    const wb = XLSX.utils.book_new();

    // Hoja 1: Datos de Productividad
    const ws1 = XLSX.utils.json_to_sheet(datosTabla);

    // Ajustar ancho de columnas
    const colWidths = [
      { wch: 15 }, // Numero OT
      { wch: 15 }, // RR
      { wch: 30 }, // Cliente
      { wch: 15 }, // Ciudad
      { wch: 30 }, // Direccion
      { wch: 15 }, // Fecha Agendada
      { wch: 15 }, // Fecha Envio
      { wch: 12 }, // Estado
      { wch: 18 }, // Tipo Servicio
      { wch: 12 }, // Consensus
    ];
    ws1['!cols'] = colWidths;

    // Aplicar estilo rojo al encabezado (fila 1)
    const headerCells = ['A1', 'B1', 'C1', 'D1', 'E1', 'F1', 'G1', 'H1', 'I1', 'J1'];
    headerCells.forEach(cell => {
      if (ws1[cell]) {
        ws1[cell].s = {
          fill: { fgColor: { rgb: "E30613" } }, // Rojo Claro
          font: { color: { rgb: "FFFFFF" }, bold: true }, // Blanco y negrita
          alignment: { horizontal: "center", vertical: "center" }
        };
      }
    });

    // Agregar la hoja al libro
    XLSX.utils.book_append_sheet(wb, ws1, "Productividad");

    // Hoja 2: Estadísticas
    const stats = calcularEstadisticas();
    const datosEstadisticas = [
      { "Periodo": "Enviadas Hoy", "Cantidad": stats.hoyCount },
      { "Periodo": "Enviadas Esta Semana", "Cantidad": stats.semanaCount },
      { "Periodo": "Enviadas Este Mes", "Cantidad": stats.mesCount },
      { "Periodo": "Total Registros", "Cantidad": productividad.length },
    ];

    const ws2 = XLSX.utils.json_to_sheet(datosEstadisticas);
    ws2['!cols'] = [{ wch: 25 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(wb, ws2, "Estadisticas");

    // Hoja 3: Resumen por Cliente
    const resumenClientes = {};
    productividad.forEach((ot) => {
      const cliente = quitarTildes(ot.cliente || "Sin cliente");
      if (!resumenClientes[cliente]) {
        resumenClientes[cliente] = 0;
      }
      resumenClientes[cliente]++;
    });

    const datosClientes = Object.entries(resumenClientes).map(([cliente, cantidad]) => ({
      "Cliente": cliente,
      "Cantidad de OTs": cantidad,
    }));

    const ws3 = XLSX.utils.json_to_sheet(datosClientes);
    ws3['!cols'] = [{ wch: 35 }, { wch: 18 }];
    XLSX.utils.book_append_sheet(wb, ws3, "Resumen por Cliente");

    // Guardar archivo
    const fecha = new Date().toISOString().split("T")[0];
    XLSX.writeFile(wb, `Productividad_OT_${fecha}.xlsx`);
  };

  const stats = calcularEstadisticas();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                🚀 Generador de Correos - Agendamiento OT
              </h1>
              <p className="text-gray-600">
                Herramienta para automatizar correos de agendamiento y
                productividad
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setMostrarConfigZoho(!mostrarConfigZoho)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2 transition"
              >
                <Settings size={20} />
                Configuracion Zoho
              </button>
              <button
                onClick={() => setMostrarHistorial(!mostrarHistorial)}
                className="bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2 transition"
              >
                📜
                Historial de Correos
              </button>
              <button
                onClick={() => setMostrarAutocheck(!mostrarAutocheck)}
                className="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2 transition"
              >
                ✅
                Autocheck/Confirmaciones
              </button>
              <button
                onClick={() => setMostrarParafiscalesMensuales(!mostrarParafiscalesMensuales)}
                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2 transition"
              >
                📋
                Parafiscales del Mes
              </button>
              <button
                onClick={() => setMostrarGestionContactos(!mostrarGestionContactos)}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2 transition"
              >
                📧
                Gestionar Contactos
              </button>
            </div>
          </div>
        </div>

        {/* Historial de Correos */}
        {mostrarHistorial && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              📜 Historial de Correos Enviados
            </h2>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-800">
                <strong>💡 ¿Para qué sirve?</strong>
              </p>
              <p className="text-sm text-blue-700 mt-1">
                Aquí puedes ver todos los correos enviados y <strong>reutilizar</strong> los datos con un solo clic. Perfecto para OTs repetidas.
              </p>
            </div>

            {/* Buscador */}
            <div className="mb-4">
              <input
                type="text"
                placeholder="🔍 Buscar por OT, Cliente o Ciudad..."
                value={busquedaHistorial}
                onChange={(e) => setBusquedaHistorial(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            {/* Lista de correos */}
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {productividad
                .filter(ot => {
                  const busqueda = busquedaHistorial.toLowerCase();
                  return (
                    ot.numeroOT?.toLowerCase().includes(busqueda) ||
                    ot.cliente?.toLowerCase().includes(busqueda) ||
                    ot.ciudad?.toLowerCase().includes(busqueda)
                  );
                })
                .map((ot) => (
                  <div
                    key={ot.id}
                    className="border border-gray-200 rounded-lg p-4 bg-gray-50 hover:border-cyan-400 hover:bg-cyan-50 transition"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <p className="font-semibold text-gray-800 text-lg">
                            OT {ot.numeroOT}
                          </p>
                          {ot.consensus && (
                            <span className="bg-purple-100 text-purple-700 text-xs font-semibold px-2 py-0.5 rounded">
                              Consensus
                            </span>
                          )}
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                            ot.estado === "Enviado" ? "bg-green-100 text-green-700" :
                            ot.estado === "Pendiente" ? "bg-yellow-100 text-yellow-700" :
                            "bg-red-100 text-red-700"
                          }`}>
                            {ot.estado}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                          <p><strong>Cliente:</strong> {ot.cliente}</p>
                          <p><strong>Ciudad:</strong> {ot.ciudad}</p>
                          <p><strong>Dirección:</strong> {ot.direccion}</p>
                          <p><strong>Fecha:</strong> {ot.fecha}</p>
                          <p><strong>Hora:</strong> {ot.hora}</p>
                          <p><strong>Servicio:</strong> {ot.tipoServicio}</p>
                          {ot.correoDestino && (
                            <p><strong>Enviado a:</strong> {ot.correoDestino}</p>
                          )}
                          {ot.rr && (
                            <p><strong>RR:</strong> {ot.rr}</p>
                          )}
                        </div>
                        
                        <p className="text-xs text-gray-500 mt-2">
                          📅 Enviado: {new Date(ot.fechaEnvio).toLocaleString("es-CO")}
                        </p>
                        
                        {ot.copiaCC && ot.copiaCC.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            <span className="text-xs text-gray-500">CC:</span>
                            {ot.copiaCC.map((contacto, idx) => (
                              <span
                                key={idx}
                                className="inline-block px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs"
                              >
                                {contacto.nombre}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <button
                        onClick={() => reutilizarCorreo(ot)}
                        className="bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2 transition whitespace-nowrap"
                      >
                        🔄 Reutilizar
                      </button>
                    </div>
                  </div>
                ))}
              
              {productividad.filter(ot => {
                const busqueda = busquedaHistorial.toLowerCase();
                return (
                  ot.numeroOT?.toLowerCase().includes(busqueda) ||
                  ot.cliente?.toLowerCase().includes(busqueda) ||
                  ot.ciudad?.toLowerCase().includes(busqueda)
                );
              }).length === 0 && (
                <p className="text-center text-gray-500 py-8">
                  {busquedaHistorial ? 'No se encontraron resultados' : 'No hay correos en el historial aún'}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Autocheck / Confirmaciones */}
        {mostrarAutocheck && <Autocheck />}

        {/* Gestión de Contactos para CC */}
        {mostrarGestionContactos && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              📧 Gestionar Contactos (Para CC)
            </h2>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-800">
                <strong>💡 ¿Cómo funciona?</strong>
              </p>
              <p className="text-sm text-blue-700 mt-1">
                <strong>🔄 Sincronización automática:</strong> Haz clic en "Sincronizar con Zoho Mail" para importar TODOS tus contactos automáticamente desde tu cuenta de Zoho Mail.
              </p>
              <p className="text-sm text-blue-700 mt-2">
                Los contactos sincronizados aparecerán como sugerencias cuando escribas en el campo CC.
              </p>
            </div>

            <div className="flex gap-3 mb-4">
              <button
                onClick={sincronizarContactosZoho}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition"
              >
                🔄 Sincronizar con Zoho Mail
              </button>
              
              <button
                onClick={agregarNuevoContacto}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition"
              >
                + Agregar Manual
              </button>
            </div>

            <div className="bg-gray-100 rounded-lg p-3 mb-3">
              <p className="text-sm font-semibold text-gray-700">
                Total de contactos: {contactosGuardados.length}
              </p>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {contactosGuardados.map((contacto, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="grid grid-cols-2 gap-3 mb-2">
                    <input
                      type="text"
                      placeholder="Nombre (Ej: Santiago Cornejo)"
                      value={contacto.nombre}
                      onChange={(e) => actualizarContacto(index, 'nombre', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded"
                    />
                    <input
                      type="email"
                      placeholder="Email (Ej: santiago.cornejo@sti.com.co)"
                      value={contacto.email}
                      onChange={(e) => actualizarContacto(index, 'email', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded"
                    />
                  </div>
                  <button
                    onClick={() => eliminarContacto(index)}
                    className="text-red-600 hover:text-red-800 text-sm font-semibold"
                  >
                    🗑️ Eliminar contacto
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Gestión de Parafiscales Mensuales */}
        {mostrarParafiscalesMensuales && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                📋 Parafiscales del Mes
              </h2>
              <input
                type="month"
                value={parafiscalesMensuales.mes}
                onChange={(e) => actualizarMesParafiscales(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-800">
                <strong>💡 ¿Para qué sirve esto?</strong>
              </p>
              <p className="text-sm text-blue-700 mt-1">
                Esta tabla de técnicos se incluirá automáticamente en TODOS los correos del mes. 
                Actualízala cada mes con los datos correctos de tus técnicos activos.
              </p>
              <p className="text-sm text-blue-700 mt-2">
                <strong>📥 Importar desde Excel:</strong> Sube un Excel con columnas: Nombre, Cédula, EPS, ARL
              </p>
            </div>

            <div className="flex gap-3 mb-4">
              <label className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg cursor-pointer text-center transition">
                📥 Importar Excel
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={importarParafiscalesExcel}
                  className="hidden"
                />
              </label>
              
              <button
                onClick={agregarTecnicoMensual}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition"
              >
                + Agregar Técnico Manual
              </button>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {parafiscalesMensuales.tecnicos.map((tecnico, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="grid grid-cols-4 gap-3 mb-2">
                    <input
                      type="text"
                      placeholder="Nombre completo"
                      value={tecnico.nombre}
                      onChange={(e) => actualizarTecnicoMensual(index, 'nombre', e.target.value)}
                      className="px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Cédula"
                      value={tecnico.cedula}
                      onChange={(e) => actualizarTecnicoMensual(index, 'cedula', e.target.value)}
                      className="px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                    <input
                      type="text"
                      placeholder="EPS"
                      value={tecnico.eps}
                      onChange={(e) => actualizarTecnicoMensual(index, 'eps', e.target.value)}
                      className="px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                    <input
                      type="text"
                      placeholder="ARL"
                      value={tecnico.arl}
                      onChange={(e) => actualizarTecnicoMensual(index, 'arl', e.target.value)}
                      className="px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                  </div>
                  <button
                    onClick={() => eliminarTecnicoMensual(index)}
                    className="text-red-600 hover:text-red-800 text-sm font-semibold"
                  >
                    🗑️ Eliminar técnico
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Configuración Zoho Mail */}
        {mostrarConfigZoho && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              ⚙️ Configuracion de Zoho Mail
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email de Zoho Mail *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={zohoConfig.email}
                    onChange={handleZohoConfigChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="danner.arias@sti.com.co"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contraseña de Zoho Mail *
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={zohoConfig.password}
                    onChange={handleZohoConfigChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Tu contraseña"
                  />
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>✅ Configuración Básica (SMTP):</strong>
                </p>
                <ol className="text-sm text-blue-700 mt-2 ml-4 list-decimal">
                  <li>Ingresa tu correo corporativo de Zoho Mail</li>
                  <li>Ingresa tu contraseña (o App Password si tienes 2FA)</li>
                  <li>Con esto ya puedes enviar correos</li>
                </ol>
              </div>

              <details className="border border-gray-300 rounded-lg">
                <summary className="cursor-pointer bg-gray-50 px-4 py-3 font-semibold text-gray-700 hover:bg-gray-100">
                  ⚙️ Configuración Avanzada (Opcional - Para Sincronizar Contactos)
                </summary>
                
                <div className="p-4 space-y-4">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
                    <p className="text-sm text-yellow-800">
                      <strong>📌 Importante:</strong> Estos campos son OPCIONALES. Solo necesitas llenarlos si quieres <strong>sincronizar automáticamente</strong> tus contactos de Zoho Mail.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Client ID (Opcional)
                      </label>
                      <input
                        type="text"
                        name="clientId"
                        value={zohoConfig.clientId}
                        onChange={handleZohoConfigChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        placeholder="1000.XXXXXXXXXXXXX"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Client Secret (Opcional)
                      </label>
                      <input
                        type="password"
                        name="clientSecret"
                        value={zohoConfig.clientSecret}
                        onChange={handleZohoConfigChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        placeholder="xxxxxxxxxxxxxxxxxxxxxxxx"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Refresh Token (Opcional)
                      </label>
                      <input
                        type="text"
                        name="refreshToken"
                        value={zohoConfig.refreshToken}
                        onChange={handleZohoConfigChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        placeholder="1000.xxxxx.xxxxx"
                      />
                    </div>
                  </div>

                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                    <p className="text-sm text-purple-800 font-semibold mb-2">
                      ¿Cómo obtener estos datos?
                    </p>
                    <ol className="text-sm text-purple-700 ml-4 list-decimal space-y-1">
                      <li>Ve a: https://api-console.zoho.com/</li>
                      <li>Crea una aplicación "Self Client"</li>
                      <li>Genera tokens con scope: ZohoMail.contacts.READ</li>
                      <li>Copia Client ID, Secret y Refresh Token aquí</li>
                    </ol>
                  </div>
                </div>
              </details>
            </div>
          </div>
        )}

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Hoy</p>
                <p className="text-3xl font-bold text-blue-600">
                  {stats.hoyCount}
                </p>
              </div>
              <Calendar className="text-blue-400" size={40} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Esta Semana</p>
                <p className="text-3xl font-bold text-green-600">
                  {stats.semanaCount}
                </p>
              </div>
              <TrendingUp className="text-green-400" size={40} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Este Mes</p>
                <p className="text-3xl font-bold text-purple-600">
                  {stats.mesCount}
                </p>
              </div>
              <CheckCircle className="text-purple-400" size={40} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Formulario */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              📝 Datos de la Orden de Trabajo
            </h2>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Numero OT *
                  </label>
                  <input
                    type="text"
                    name="numeroOT"
                    value={formData.numeroOT}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="22XXXXXX"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo Servicio
                  </label>
                  <select
                    name="tipoServicio"
                    value={formData.tipoServicio}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option>ENTREGA DE SERVICIO</option>
                    <option>Instalacion</option>
                    <option>Mantenimiento</option>
                    <option>Reparacion</option>
                    <option>Inspeccion</option>
                    <option>Site Survey</option>
                  </select>
                </div>

                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="consensus"
                      checked={formData.consensus}
                      onChange={(e) => setFormData(prev => ({ ...prev, consensus: e.target.checked }))}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      ¿Se agendó también en Consensus?
                    </span>
                  </label>
                  <p className="text-xs text-gray-500 mt-1 ml-6">
                    Marca si esta OT también fue agendada en Consensus
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cliente *
                </label>
                <input
                  type="text"
                  name="cliente"
                  value={formData.cliente}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Nombre del cliente"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ciudad *
                  </label>
                  <input
                    type="text"
                    name="ciudad"
                    value={formData.ciudad}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="PEREIRA"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Direccion *
                  </label>
                  <input
                    type="text"
                    name="direccion"
                    value={formData.direccion}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="PEREIRA/CR 9 20-27"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha *
                  </label>
                  <input
                    type="date"
                    name="fecha"
                    value={formData.fecha}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hora *
                  </label>
                  <input
                    type="time"
                    name="hora"
                    value={formData.hora}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duracion de la actividad *
                </label>
                <input
                  type="text"
                  name="duracion"
                  value={formData.duracion}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="4-8 horas"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Correo Destino *
                </label>
                <input
                  type="email"
                  name="correoDestino"
                  value={formData.correoDestino}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="cliente@ejemplo.com"
                  required
                />
              </div>

              {/* Subir archivo ZIP */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Adjuntar Documento
                </label>
                <div className="flex items-center gap-2">
                  <label className="flex-1 flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <FileArchive size={20} className="text-gray-500" />
                    <span className="text-sm text-gray-600">
                      {archivoZip ? archivoZip.name : "Seleccionar archivo..."}
                    </span>
                    <input
                      type="file"
                      accept=".zip,.pdf,.doc,.docx,.xls,.xlsx,.rar,.7z"
                      onChange={handleArchivoZip}
                      className="hidden"
                    />
                  </label>
                  {archivoZip && (
                    <button
                      onClick={() => setArchivoZip(null)}
                      className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 text-sm"
                    >
                      Quitar
                    </button>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Formatos: ZIP, PDF, Word, Excel, RAR
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Observaciones
                </label>
                <textarea
                  name="observaciones"
                  value={formData.observaciones}
                  onChange={handleInputChange}
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Informacion adicional..."
                />
              </div>

              {/* Campo para pegar tabla personalizada */}
              <div className="border-2 border-dashed border-blue-300 rounded-lg p-4 bg-blue-50">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  📋 Tabla de Parafiscales Personalizada (Opcional)
                </label>
                <p className="text-xs text-gray-600 mb-2">
                  💡 <strong>Cómo usar:</strong> Copia la tabla desde Excel y pégala aquí (Ctrl+V). El formato se mantendrá en el correo.
                </p>
                <div
                  contentEditable={true}
                  onPaste={(e) => {
                    e.preventDefault();
                    const html = e.clipboardData.getData('text/html');
                    if (html) {
                      // Guardar el HTML de la tabla
                      setFormData(prev => ({ ...prev, tablaPersonalizada: html }));
                      e.currentTarget.innerHTML = html;
                    } else {
                      alert('⚠️ Por favor copia la tabla desde Excel (no texto plano)');
                    }
                  }}
                  onInput={(e) => {
                    // Si el usuario edita manualmente, actualizar
                    setFormData(prev => ({ ...prev, tablaPersonalizada: e.currentTarget.innerHTML }));
                  }}
                  className="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white overflow-auto"
                  style={{ maxHeight: '300px' }}
                  dangerouslySetInnerHTML={{ __html: formData.tablaPersonalizada }}
                />
                <div className="flex gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, tablaPersonalizada: '' }))}
                    className="text-xs bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded transition"
                  >
                    🗑️ Limpiar Tabla
                  </button>
                  {formData.tablaPersonalizada && (
                    <span className="text-xs text-green-600 font-semibold flex items-center gap-1">
                      ✓ Tabla personalizada activa (no se usará la tabla mensual)
                    </span>
                  )}
                  {!formData.tablaPersonalizada && (
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      ℹ️ Si está vacío, se usará la tabla mensual automáticamente
                    </span>
                  )}
                </div>
              </div>

              {/* Sistema de Copia (CC) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Enviar copia a (CC)
                </label>
                
                <div className="flex gap-2 mb-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={inputCC}
                      onChange={handleInputCCChange}
                      onKeyDown={handleKeyDownCC}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Escribe nombre o email (Ej: santi)"
                    />
                    
                    {/* Sugerencias de autocompletado */}
                    {sugerenciasCC.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                        {sugerenciasCC.map((contacto, index) => (
                          <div
                            key={index}
                            onClick={() => agregarCC(contacto)}
                            className="px-3 py-2 hover:bg-blue-50 cursor-pointer"
                          >
                            <div className="font-medium text-sm">{contacto.nombre}</div>
                            <div className="text-xs text-gray-500">{contacto.email}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => {
                      setMostrarSelectorMultiple(true);
                      setContactosSeleccionados([]);
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold whitespace-nowrap"
                  >
                    📋 Seleccionar Múltiples
                  </button>
                </div>
                
                {/* Destinatarios en copia agregados */}
                {formData.copiaCC.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.copiaCC.map((contacto, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm"
                        title={contacto.email}
                      >
                        📧 {contacto.nombre}
                        <button
                          onClick={() => eliminarCC(contacto.email)}
                          className="hover:text-green-900 font-bold"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  💡 Presiona Enter para agregar uno, o usa "Seleccionar Múltiples" para varios a la vez.
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={copiarCorreo}
                  disabled={
                    !formData.numeroOT || 
                    !formData.cliente || 
                    !formData.ciudad || 
                    !formData.direccion || 
                    !formData.fecha || 
                    !formData.hora || 
                    !formData.duracion
                  }
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition"
                >
                  <Copy size={20} />
                  {copied ? "✓ Copiado" : "Copiar Correo"}
                </button>

                <button
                  onClick={enviarCorreoZoho}
                  disabled={
                    !formData.numeroOT ||
                    !formData.cliente ||
                    !formData.ciudad ||
                    !formData.direccion ||
                    !formData.fecha ||
                    !formData.hora ||
                    !formData.duracion ||
                    !formData.correoDestino
                  }
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition"
                >
                  <Mail size={20} />
                  {registrado ? "✓ Enviado" : "Enviar con Zoho"}
                </button>
              </div>
            </div>
          </div>

          {/* Vista Previa */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                📧 Vista Previa del Correo
              </h2>

              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="mb-4">
                  <p className="text-xs font-semibold text-gray-500 mb-1">
                    ASUNTO:
                  </p>
                  <p className="text-sm font-medium text-gray-800">
                    {generarAsunto()}
                  </p>
                </div>

                <div className="border-t pt-4">
                  <p className="text-xs font-semibold text-gray-500 mb-2">
                    CUERPO:
                  </p>
                  <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono bg-white p-4 rounded border border-gray-200 max-h-96 overflow-y-auto">
                    {generarCuerpo()}
                  </pre>
                </div>
              </div>
            </div>

            {/* Productividad */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">
                  📊 Productividad
                </h2>
                <button
                  onClick={exportarExcel}
                  disabled={productividad.length === 0}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white text-sm font-semibold py-2 px-4 rounded-lg flex items-center gap-2 transition"
                >
                  <Download size={16} />
                  Exportar Excel
                </button>
              </div>

              <div className="max-h-96 overflow-y-auto">
                {productividad.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No hay registros aun
                  </p>
                ) : (
                  <div className="space-y-2">
                    {productividad.slice(0, 20).map((ot) => (
                      <div
                        key={ot.id}
                        className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-blue-300 transition"
                      >
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <p className="font-semibold text-gray-800">
                                OT {ot.numeroOT}
                              </p>
                              {ot.consensus && (
                                <span className="bg-purple-100 text-purple-700 text-xs font-semibold px-2 py-0.5 rounded">
                                  Consensus
                                </span>
                              )}
                            </div>
                            
                            <p className="text-sm text-gray-600 mb-1">
                              {ot.cliente} - {ot.ciudad}
                            </p>
                            
                            <p className="text-xs text-gray-500">
                              <Clock size={12} className="inline mr-1" />
                              {new Date(ot.fechaEnvio).toLocaleString("es-CO")}
                            </p>
                            
                            {/* Input para RR */}
                            <div className="mt-2">
                              <input
                                type="text"
                                placeholder="Número RR (opcional)"
                                value={ot.rr || ""}
                                onChange={(e) => actualizarRR(ot.id, e.target.value)}
                                className="w-48 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                            
                            {/* Mostrar destinatarios en copia si existen */}
                            {ot.copiaCC && ot.copiaCC.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                <span className="text-xs text-gray-500">CC:</span>
                                {ot.copiaCC.map((contacto, idx) => (
                                  <span
                                    key={idx}
                                    className="inline-block px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs"
                                    title={contacto.email}
                                  >
                                    {contacto.nombre}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          
                          {/* Dropdown para cambiar estado */}
                          <select
                            value={ot.estado}
                            onChange={(e) => actualizarEstadoOT(ot.id, e.target.value)}
                            className={`text-xs font-semibold px-3 py-1.5 rounded border-2 cursor-pointer ${
                              ot.estado === "Enviado" ? "bg-green-100 text-green-800 border-green-300" :
                              ot.estado === "Pendiente" ? "bg-yellow-100 text-yellow-800 border-yellow-300" :
                              "bg-red-100 text-red-800 border-red-300"
                            }`}
                          >
                            <option value="Enviado">✓ Enviado</option>
                            <option value="Pendiente">⏰ Pendiente</option>
                            <option value="Cancelado">✗ Cancelado</option>
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {productividad.length > 20 && (
                <p className="text-center text-sm text-gray-500 mt-4">
                  Mostrando 20 de {productividad.length} registros
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 bg-white rounded-lg shadow p-4 text-center text-sm text-gray-600">
          <p>
            💡 <strong>Tip:</strong> Puedes copiar el correo y pegarlo en Zoho
            Mail manualmente, o usar el boton "Enviar con Zoho" para envio
            automatico.
          </p>
          <p className="mt-2 text-xs text-gray-500">
            Los datos se guardan automaticamente en tu navegador
          </p>
        </div>

        {/* Modal de Selección Múltiple */}
        {mostrarSelectorMultiple && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col">
              <div className="p-6 border-b">
                <h2 className="text-2xl font-bold text-gray-800">
                  📋 Seleccionar Múltiples Contactos
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Selecciona todos los contactos que recibirán copia del correo
                </p>
              </div>

              <div className="p-6 overflow-y-auto flex-1">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                  <p className="text-sm text-blue-800">
                    ✅ Seleccionados: <strong>{contactosSeleccionados.length}</strong> contactos
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {contactosGuardados.map((contacto, index) => {
                    const isSelected = contactosSeleccionados.some(c => c.email === contacto.email);
                    const yaAgregado = formData.copiaCC.some(c => c.email === contacto.email);
                    
                    return (
                      <div
                        key={index}
                        onClick={() => {
                          if (yaAgregado) return;
                          
                          if (isSelected) {
                            setContactosSeleccionados(prev => 
                              prev.filter(c => c.email !== contacto.email)
                            );
                          } else {
                            setContactosSeleccionados(prev => [...prev, contacto]);
                          }
                        }}
                        className={`
                          border-2 rounded-lg p-3 cursor-pointer transition
                          ${yaAgregado 
                            ? 'bg-gray-100 border-gray-300 cursor-not-allowed opacity-50' 
                            : isSelected 
                              ? 'bg-green-50 border-green-500' 
                              : 'bg-white border-gray-200 hover:border-blue-400'
                          }
                        `}
                      >
                        <div className="flex items-start gap-2">
                          <div className={`
                            w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 flex-shrink-0
                            ${yaAgregado
                              ? 'bg-gray-300 border-gray-400'
                              : isSelected 
                                ? 'bg-green-500 border-green-500' 
                                : 'border-gray-300'
                            }
                          `}>
                            {(isSelected || yaAgregado) && (
                              <span className="text-white text-xs">✓</span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm text-gray-800 truncate">
                              {contacto.nombre}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {contacto.email}
                            </p>
                            {yaAgregado && (
                              <p className="text-xs text-green-600 mt-1">
                                Ya agregado ✓
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {contactosGuardados.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-500 mb-4">
                      No hay contactos guardados
                    </p>
                    <button
                      onClick={() => {
                        setMostrarSelectorMultiple(false);
                        setMostrarGestionContactos(true);
                      }}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                    >
                      Agregar Contactos
                    </button>
                  </div>
                )}
              </div>

              <div className="p-6 border-t flex gap-3">
                <button
                  onClick={() => {
                    setMostrarSelectorMultiple(false);
                    setContactosSeleccionados([]);
                  }}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-3 px-4 rounded-lg transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    agregarMultiplesCC(contactosSeleccionados);
                    setMostrarSelectorMultiple(false);
                    setContactosSeleccionados([]);
                  }}
                  disabled={contactosSeleccionados.length === 0}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-semibold py-3 px-4 rounded-lg transition"
                >
                  Agregar {contactosSeleccionados.length > 0 && `(${contactosSeleccionados.length})`}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgendamientoOT;