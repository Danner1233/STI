import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";

// ✅ COMPONENTES MODULARES
import Autocheck from "./Autocheck";
import ConfiguracionZoho from "./components/ConfiguracionZoho";
import Historial from "./components/Historial";
import GestionContactos from "./components/GestionContactos";
import Productividad from "./components/Productividad";
import ModalSelectorCC from "./components/ModalSelectorCC";
import ParafiscalesMensuales from "./components/ParafiscalesMensuales";
import Formulario from "./components/Formulario";
import VistaPrevia from "./components/VistaPrevia";
import Estadisticas from "./components/Estadisticas";
import RegistroRapido from "./components/RegistroRapido";

// Iconos
import { Settings } from "lucide-react";

const AgendamientoOT = () => {
  // ========== ESTADOS ==========
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
    consensus: false, // ❌ Por defecto DESMARCADO - el usuario debe marcarlo manualmente
    tablaPersonalizada: "",
    copiaCC: [],
  });

  const [contactosGuardados, setContactosGuardados] = useState(() => {
    const saved = localStorage.getItem('contactos-guardados');
    return saved ? JSON.parse(saved) : [
      { nombre: 'Santiago Cornejo', email: 'santiago.cornejo@sti.com.co' },
      { nombre: 'Danner Arias', email: 'danner.arias@sti.com.co' },
    ];
  });

  const [inputCC, setInputCC] = useState('');
  const [sugerenciasCC, setSugerenciasCC] = useState([]);

  const [parafiscalesMensuales, setParafiscalesMensuales] = useState(() => {
    const saved = localStorage.getItem('parafiscales-mensuales');
    return saved ? JSON.parse(saved) : {
      mes: new Date().toISOString().slice(0, 7),
      tecnicos: [
        {
          nombre: "DANIEL JARAMILLO BETANCUR",
          cedula: "10.050.343",
          eps: "SO S SERVICIO OCCIDENTAL DE SALUD S A",
          arl: "COLPATRIA ARL"
        }
      ]
    };
  });

  const [mostrarParafiscalesMensuales, setMostrarParafiscalesMensuales] = useState(false);
  const [mostrarHistorial, setMostrarHistorial] = useState(false);
  const [mostrarAutocheck, setMostrarAutocheck] = useState(false);
  const [mostrarGestionContactos, setMostrarGestionContactos] = useState(false);
  const [mostrarSelectorMultiple, setMostrarSelectorMultiple] = useState(false);
  const [mostrarConfigZoho, setMostrarConfigZoho] = useState(false);

  const [archivoZip, setArchivoZip] = useState(null);
  const [copied, setCopied] = useState(false);
  const [registrado, setRegistrado] = useState(false);

  const [zohoConfig, setZohoConfig] = useState(() => {
    const saved = localStorage.getItem("zoho-config");
    return saved ? JSON.parse(saved) : {
      email: "",
      password: "",
      fromEmail: "agendamiento@sti.com.co",
      clientId: "",
      clientSecret: "",
      refreshToken: "",
    };
  });

  const [productividad, setProductividad] = useState(() => {
    const saved = localStorage.getItem("productividad-ot");
    return saved ? JSON.parse(saved) : [];
  });

  // ========== EFFECTS ==========
  useEffect(() => {
    localStorage.setItem('contactos-guardados', JSON.stringify(contactosGuardados));
  }, [contactosGuardados]);

  useEffect(() => {
    localStorage.setItem('parafiscales-mensuales', JSON.stringify(parafiscalesMensuales));
  }, [parafiscalesMensuales]);

  useEffect(() => {
    localStorage.setItem("productividad-ot", JSON.stringify(productividad));
  }, [productividad]);

  useEffect(() => {
    localStorage.setItem("zoho-config", JSON.stringify(zohoConfig));
  }, [zohoConfig]);

  useEffect(() => {
    const pendientes = productividad.filter(ot => ot.estado === "Pendiente");
    if (pendientes.length > 0) {
      const timer = setTimeout(() => {
        alert(`⏰ RECORDATORIO:\n\nTienes ${pendientes.length} OT(s) pendiente(s)`);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [productividad]);

  // ========== HANDLERS ==========
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleInputCCChange = (e) => {
    const value = e.target.value;
    setInputCC(value);

    if (value.length > 0) {
      const sugerencias = contactosGuardados.filter(contacto => {
        const match = contacto.nombre.toLowerCase().includes(value.toLowerCase()) ||
                     contacto.email.toLowerCase().includes(value.toLowerCase());
        const yaAgregado = formData.copiaCC.some(cc => cc.email === contacto.email);
        return match && !yaAgregado;
      });
      setSugerenciasCC(sugerencias);
    } else {
      setSugerenciasCC([]);
    }
  };

  const agregarCC = (contacto) => {
    if (contacto.email && !formData.copiaCC.some(cc => cc.email === contacto.email)) {
      setFormData(prev => ({
        ...prev,
        copiaCC: [...prev.copiaCC, contacto]
      }));
    }
    setInputCC('');
    setSugerenciasCC([]);
  };

  const handleKeyDownCC = (e) => {
    if (e.key === 'Enter' && inputCC.trim()) {
      e.preventDefault();
      if (sugerenciasCC.length > 0) {
        agregarCC(sugerenciasCC[0]);
      }
    }
  };

  const eliminarCC = (emailAEliminar) => {
    setFormData(prev => ({
      ...prev,
      copiaCC: prev.copiaCC.filter(cc => cc.email !== emailAEliminar)
    }));
  };

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

  const handleArchivoZip = (e) => {
    const file = e.target.files[0];
    if (file) setArchivoZip(file);
  };

  const handleZohoConfigChange = (e) => {
    const { name, value } = e.target;
    setZohoConfig(prev => ({ ...prev, [name]: value }));
  };

  // ========== PARAFISCALES ==========
  const agregarTecnicoMensual = () => {
    setParafiscalesMensuales(prev => ({
      ...prev,
      tecnicos: [...prev.tecnicos, { nombre: "", cedula: "", eps: "", arl: "" }]
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
    setParafiscalesMensuales(prev => ({ ...prev, mes: nuevoMes }));
  };

  const importarParafiscalesExcel = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      alert('⚠️ Por favor selecciona un archivo Excel');
      return;
    }

    try {
      const reader = new FileReader();
      reader.onload = (event) => {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        const nuevosTecnicos = jsonData.map(row => ({
          nombre: row['Nombre'] || row['nombre'] || '',
          cedula: row['Cédula'] || row['Cedula'] || '',
          eps: row['EPS'] || row['eps'] || '',
          arl: row['ARL'] || row['arl'] || ''
        }));

        setParafiscalesMensuales(prev => ({ ...prev, tecnicos: nuevosTecnicos }));
        alert(`✅ ${nuevosTecnicos.length} técnicos importados!`);
      };
      reader.readAsArrayBuffer(file);
    } catch (err) {
      console.error('Error al cargar Excel:', err);
      alert('❌ Error al cargar el archivo');
    }
    e.target.value = '';
  };

  // ========== CONTACTOS ==========
  const agregarNuevoContacto = () => {
    setContactosGuardados(prev => [...prev, { nombre: "", email: "" }]);
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

  const sincronizarContactosZoho = async () => {
    if (!zohoConfig.clientId || !zohoConfig.clientSecret || !zohoConfig.refreshToken) {
      alert('⚠️ Configura tus credenciales OAuth primero');
      setMostrarConfigZoho(true);
      return;
    }
    // Implementar sincronización...
  };

  // ========== GENERADORES ==========
  const generarAsunto = () => {
    return `CLARO COLOMBIA ENTREGA DE SERVICIO-${formData.cliente.toUpperCase()}- OT ${formData.numeroOT}`;
  };

  const generarCuerpo = () => {
    const dias = ["Domingo", "Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado"];
    const meses = ["enero", "febrero", "marzo", "abril", "mayo", "junio", 
                  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

    let fechaFormateada = "";
    if (formData.fecha) {
      const fecha = new Date(formData.fecha + "T00:00:00");
      fechaFormateada = `${dias[fecha.getDay()]} ${fecha.getDate()} de ${meses[fecha.getMonth()]} de ${fecha.getFullYear()}`;
    }

    return `Buen dia

Señores

${formData.cliente.toUpperCase()}

Queremos confirmarle la actividad de ${formData.tipoServicio.toUpperCase()} para la sede relacionada en el cuadro.

Duracion de la actividad: ${formData.duracion}

┌─────────────────────────────────────────────────────────────────────┐
│ OT            FECHA           HORA      CIUDAD      DIRECCION       │
├─────────────────────────────────────────────────────────────────────┤
│ ${formData.numeroOT.padEnd(13)} ${fechaFormateada.padEnd(15)} ${formData.hora.padEnd(11)} ${formData.ciudad.padEnd(11)} ${formData.direccion.padEnd(15)} │
└─────────────────────────────────────────────────────────────────────┘

PARAFISCALES DE LOS TECNICOS:
${parafiscalesMensuales.tecnicos.map(tec => 
  `${String(tec.nombre || '').padEnd(35)} CC: ${String(tec.cedula || '').padEnd(15)} EPS: ${String(tec.eps || '').padEnd(20)} ARL: ${String(tec.arl || '')}`
).join('\n')}`;
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
          formData.tablaPersonalizada
        : 
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

  // ========== ACCIONES ==========
  const copiarCorreo = () => {
    const camposFaltantes = [];
    if (!formData.numeroOT) camposFaltantes.push('Número OT');
    if (!formData.cliente) camposFaltantes.push('Cliente');
    
    if (camposFaltantes.length > 0) {
      alert(`⚠️ Completa: ${camposFaltantes.join(', ')}`);
      return;
    }

    const asunto = generarAsunto();
    const cuerpo = generarCuerpo();
    navigator.clipboard.writeText(`ASUNTO:\n${asunto}\n\n${cuerpo}`).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const enviarCorreoZoho = async () => {
    // ⚠️ VALIDACIÓN CRÍTICA DE CONSENSUS
    if (!formData.consensus) {
      const confirmacion = window.confirm(
        '⚠️⚠️⚠️ ATENCIÓN URGENTE ⚠️⚠️⚠️\n\n' +
        '🚨 NO HAS MARCADO QUE AGENDASTE EN CONSENSUS 🚨\n\n' +
        '❌ El checkbox de "Agendado en Consensus" está DESMARCADO\n\n' +
        '¿Ya agendaste esta OT en la plataforma de Consensus?\n\n' +
        '• SI ya la agendaste → Click "Cancelar", marca el checkbox y envía de nuevo\n' +
        '• NO la has agendado → Click "Cancelar" y NO ENVÍES ESTE CORREO hasta agendar\n\n' +
        '⚠️ ¿Estás ABSOLUTAMENTE SEGURO de que quieres enviar sin marcar Consensus?'
      );

      if (!confirmacion) {
        alert('✅ Correo NO enviado.\n\n📋 Por favor:\n1. Agenda la OT en Consensus\n2. Marca el checkbox\n3. Intenta enviar de nuevo');
        return;
      }

      // Segunda confirmación si el usuario insiste
      const segundaConfirmacion = window.confirm(
        '🚨 ÚLTIMA ADVERTENCIA 🚨\n\n' +
        'Estás a punto de enviar un correo SIN agendar en Consensus.\n\n' +
        'Esto puede causar problemas graves:\n' +
        '• Descoordinación con el equipo\n' +
        '• Pérdida de seguimiento\n' +
        '• Incumplimiento de procesos\n\n' +
        '¿REALMENTE quieres continuar sin Consensus?'
      );

      if (!segundaConfirmacion) {
        alert('✅ Correo NO enviado.\n\n¡Gracias por verificar! Agenda en Consensus primero.');
        return;
      }

      // Tercera y última advertencia
      alert(
        '⚠️ ENVIANDO SIN CONSENSUS ⚠️\n\n' +
        'El correo se enviará pero quedará registrado que NO fue agendado en Consensus.\n\n' +
        'Recuerda agendarlo después para evitar problemas.'
      );
    }

    if (!zohoConfig.email || !zohoConfig.password) {
      alert("Configura tus credenciales SMTP primero");
      setMostrarConfigZoho(true);
      return;
    }
    
    try {
      const emailData = {
        fromAddress: zohoConfig.fromEmail || zohoConfig.email,
        toAddress: formData.correoDestino,
        cc: formData.copiaCC.map(c => c.email).join(', '),
        subject: generarAsunto(),
        content: generarCuerpoHTML(),
      };

      if (archivoZip) {
        const reader = new FileReader();
        reader.onload = async (e) => {
          emailData.attachments = [{
            attachmentName: archivoZip.name,
            content: e.target.result.split(",")[1],
          }];
          await enviarCorreoConBackend(emailData);
        };
        reader.readAsDataURL(archivoZip);
      } else {
        await enviarCorreoConBackend(emailData);
      }
    } catch (err) {
      console.error('Error al enviar correo:', err);
      alert("Error al enviar el correo");
    }
  };

  const enviarCorreoConBackend = async (emailData) => {
    const response = await fetch("http://localhost:3001/api/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        smtpConfig: { email: zohoConfig.email, password: zohoConfig.password },
        emailData: emailData,
      }),
    });

    if (response.ok) {
      alert("✓ Correo enviado!");
      registrarEnvio();
    }
  };

  const registrarEnvio = () => {
    const nuevo = {
      id: Date.now(),
      ...formData,
      fechaEnvio: new Date().toISOString(),
      estado: "Enviado",
      rr: "",
    };

    setProductividad(prev => [nuevo, ...prev]);
    setRegistrado(true);
    setTimeout(() => setRegistrado(false), 2000);

    // Limpiar
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
      consensus: false, // ❌ Por defecto DESMARCADO
      tablaPersonalizada: "",
      copiaCC: [],
    });
    setArchivoZip(null);
  };

  // ========== REGISTRO RÁPIDO (sin envío de correo) ==========
  const registrarRapido = (datosRapidos) => {
    const nuevoRegistro = {
      id: Date.now(),
      numeroOT: datosRapidos.numeroOT,
      rr: datosRapidos.rr || "",
      cliente: datosRapidos.cliente,
      ciudad: "",
      direccion: "",
      fecha: datosRapidos.fecha || "",
      hora: "",
      correoDestino: "",
      contacto: "",
      telefono: "",
      tipoServicio: datosRapidos.tipoServicio,
      observaciones: "📝 Registro rápido - Sin correo enviado",
      duracion: "",
      consensus: datosRapidos.consensus,
      tablaPersonalizada: "",
      copiaCC: [],
      fechaEnvio: new Date().toISOString(),
      estado: "Enviado", // "Enviado" para que aparezca en completadas
    };

    setProductividad(prev => [nuevoRegistro, ...prev]);
  };

  const actualizarEstadoOT = (id, nuevoEstado) => {
    setProductividad(prev => 
      prev.map(ot => ot.id === id ? { ...ot, estado: nuevoEstado } : ot)
    );
  };

  const actualizarRR = (id, nuevoRR) => {
    setProductividad(prev => 
      prev.map(ot => ot.id === id ? { ...ot, rr: nuevoRR } : ot)
    );
  };

  const reutilizarCorreo = (ot) => {
    setFormData({
      ...ot,
      consensus: ot.consensus || false, // Mantener el valor del historial o false
      copiaCC: ot.copiaCC || [],
    });
    setMostrarHistorial(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const calcularEstadisticas = () => {
    const hoy = new Date().toDateString();
    const inicioSemana = new Date();
    inicioSemana.setDate(inicioSemana.getDate() - inicioSemana.getDay());
    const inicioMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

    return {
      hoyCount: productividad.filter(ot => new Date(ot.fechaEnvio).toDateString() === hoy).length,
      semanaCount: productividad.filter(ot => new Date(ot.fechaEnvio) >= inicioSemana).length,
      mesCount: productividad.filter(ot => new Date(ot.fechaEnvio) >= inicioMes).length,
    };
  };

  const stats = calcularEstadisticas();

  // ========== RENDER ==========
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
                Herramienta para automatizar correos de agendamiento
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setMostrarConfigZoho(!mostrarConfigZoho)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2 transition"
              >
                <Settings size={20} />
                Config Zoho
              </button>
              <button
                onClick={() => setMostrarHistorial(!mostrarHistorial)}
                className="bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-2 px-4 rounded-lg transition"
              >
                📜 Historial
              </button>
              <button
                onClick={() => setMostrarAutocheck(!mostrarAutocheck)}
                className="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-4 rounded-lg transition"
              >
                ✅ Autocheck
              </button>
              <button
                onClick={() => setMostrarParafiscalesMensuales(!mostrarParafiscalesMensuales)}
                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition"
              >
                📋 Parafiscales
              </button>
              <button
                onClick={() => setMostrarGestionContactos(!mostrarGestionContactos)}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition"
              >
                📧 Contactos
              </button>
            </div>
          </div>
        </div>

        {/* ✅ COMPONENTES */}
        {mostrarHistorial && (
          <Historial 
            productividad={productividad}
            onReutilizar={reutilizarCorreo}
            onClose={() => setMostrarHistorial(false)}
          />
        )}

        {mostrarAutocheck && <Autocheck />}

        {mostrarGestionContactos && (
          <GestionContactos
            contactosGuardados={contactosGuardados}
            onAgregarNuevo={agregarNuevoContacto}
            onActualizar={actualizarContacto}
            onEliminar={eliminarContacto}
            onSincronizarZoho={sincronizarContactosZoho}
            onClose={() => setMostrarGestionContactos(false)}
          />
        )}

        {mostrarConfigZoho && (
          <ConfiguracionZoho
            zohoConfig={zohoConfig}
            onConfigChange={handleZohoConfigChange}
            onClose={() => setMostrarConfigZoho(false)}
          />
        )}

        {mostrarParafiscalesMensuales && (
          <ParafiscalesMensuales
            parafiscalesMensuales={parafiscalesMensuales}
            onActualizarMes={actualizarMesParafiscales}
            onAgregarTecnico={agregarTecnicoMensual}
            onActualizarTecnico={actualizarTecnicoMensual}
            onEliminarTecnico={eliminarTecnicoMensual}
            onImportarExcel={importarParafiscalesExcel}
            onClose={() => setMostrarParafiscalesMensuales(false)}
          />
        )}

        {/* Estadísticas */}
        <Estadisticas 
          hoyCount={stats.hoyCount}
          semanaCount={stats.semanaCount}
          mesCount={stats.mesCount}
        />

        {/* Registro Rápido - Formulario Visible */}
        <RegistroRapido onRegistrar={registrarRapido} />

        {/* Formulario y Vista Previa */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Formulario
            formData={formData}
            onInputChange={handleInputChange}
            inputCC={inputCC}
            onInputCCChange={handleInputCCChange}
            onKeyDownCC={handleKeyDownCC}
            sugerenciasCC={sugerenciasCC}
            onAgregarCC={agregarCC}
            onEliminarCC={eliminarCC}
            onMostrarSelectorMultiple={() => setMostrarSelectorMultiple(true)}
            archivoZip={archivoZip}
            onArchivoZipChange={handleArchivoZip}
            onEliminarArchivo={() => setArchivoZip(null)}
            onCopiarCorreo={copiarCorreo}
            onEnviarCorreo={enviarCorreoZoho}
            copied={copied}
            registrado={registrado}
          />

          <div className="space-y-6">
            <VistaPrevia 
              asunto={generarAsunto()}
              cuerpo={generarCuerpo()}
            />

            <Productividad
              productividad={productividad}
              onActualizarEstado={actualizarEstadoOT}
              onActualizarRR={actualizarRR}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 bg-white rounded-lg shadow p-4 text-center text-sm text-gray-600">
          <p>💡 Los datos se guardan automáticamente en tu navegador</p>
        </div>

        {/* Modal Selector CC */}
        {mostrarSelectorMultiple && (
          <ModalSelectorCC
            contactosGuardados={contactosGuardados}
            copiaCC={formData.copiaCC}
            onAgregar={agregarMultiplesCC}
            onClose={() => setMostrarSelectorMultiple(false)}
            onAbrirGestionContactos={() => {
              setMostrarSelectorMultiple(false);
              setMostrarGestionContactos(true);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default AgendamientoOT;