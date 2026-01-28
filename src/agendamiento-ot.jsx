import React, { useState, useEffect, useRef } from "react";
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
import OTsPendientes from "./components/OTsPendientes";
import FloatingModal from "./components/FloatingModal";
import BusquedaRapida from "./components/BusquedaRapida";
import ZonificadorMejorado from "./components/ZonificadorMejorado";
import GuiaEscalamiento from "./components/GuiaEscalamiento";
import GestionPDT from "./components/GestionPDT";
import { SERVICIOS_PDT } from "./constants/serviciosPDT";
import { generarPDT, obtenerPlantillaPDT } from "./utils/generadorPDT";

// Iconos
import {
  Settings,
  Clock,
  Menu,
  X,
  Map,
  Search,
  BookOpen,
  FileSpreadsheet,
} from "lucide-react";

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
    servicioPDT: "",
    generarPDT: null, // null = no decidido, true = necesita, false = no necesita
    pdtSubido: false, // ← NUEVO: Confirmación de que subió el PDT
    confirmoNoPDT: false, // ← NUEVO: Confirmación de que NO necesita PDT
    observaciones: "",
    duracion: "4-8 horas",
    consensus: false,
    tablaPersonalizada: "",
    copiaCC: [],
  });

  const [contactosGuardados, setContactosGuardados] = useState(() => {
    const saved = localStorage.getItem("contactos-guardados");
    return saved
      ? JSON.parse(saved)
      : [
          { nombre: "Santiago Cornejo", email: "santiago.cornejo@sti.com.co" },
          { nombre: "Danner Arias", email: "danner.arias@sti.com.co" },
        ];
  });

  const [inputCC, setInputCC] = useState("");
  const [sugerenciasCC, setSugerenciasCC] = useState([]);

  const [parafiscalesMensuales, setParafiscalesMensuales] = useState(() => {
    const saved = localStorage.getItem("parafiscales-mensuales");
    return saved
      ? JSON.parse(saved)
      : {
          mes: new Date().toISOString().slice(0, 7),
          tecnicos: [
            {
              nombre: "DANIEL JARAMILLO BETANCUR",
              cedula: "10.050.343",
              eps: "SO S SERVICIO OCCIDENTAL DE SALUD S A",
              arl: "COLPATRIA ARL",
            },
          ],
        };
  });

  const [mostrarParafiscalesMensuales, setMostrarParafiscalesMensuales] = useState(false);
  const [mostrarHistorial, setMostrarHistorial] = useState(false);
  const [mostrarAutocheck, setMostrarAutocheck] = useState(false);
  const [mostrarGestionContactos, setMostrarGestionContactos] = useState(false);
  const [mostrarSelectorMultiple, setMostrarSelectorMultiple] = useState(false);
  const [mostrarConfigZoho, setMostrarConfigZoho] = useState(false);
  const [mostrarPendientes, setMostrarPendientes] = useState(false);
  const [forceUpdatePendientes, setForceUpdatePendientes] = useState(0); // ← Para forzar actualización
  const [mostrarMenu, setMostrarMenu] = useState(false);
  const [mostrarZonificador, setMostrarZonificador] = useState(false);
  const [mostrarBusqueda, setMostrarBusqueda] = useState(false);
  const [mostrarGuiaEscalamiento, setMostrarGuiaEscalamiento] = useState(false);
  const [mostrarGestionPDT, setMostrarGestionPDT] = useState(false);

  const [archivoZip, setArchivoZip] = useState(null);
  const fileInputRef = useRef(null); // ← REF para resetear input file
  const [copied, setCopied] = useState(false);
  const [registrado, setRegistrado] = useState(false);

  const [zohoConfig, setZohoConfig] = useState(() => {
    const saved = localStorage.getItem("zoho-config");
    return saved
      ? JSON.parse(saved)
      : {
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
    localStorage.setItem("contactos-guardados", JSON.stringify(contactosGuardados));
  }, [contactosGuardados]);

  useEffect(() => {
    localStorage.setItem("parafiscales-mensuales", JSON.stringify(parafiscalesMensuales));
  }, [parafiscalesMensuales]);

  useEffect(() => {
    try {
      // 🔥 LIMITAR A ÚLTIMOS 500 REGISTROS para no llenar localStorage
      const registrosLimitados = productividad.slice(0, 500);
      localStorage.setItem("productividad-ot", JSON.stringify(registrosLimitados));
      
      // Si teníamos más de 500, avisar
      if (productividad.length > 500) {
        console.warn(`⚠️ Productividad tiene ${productividad.length} registros. Solo se guardan los últimos 500.`);
      }
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        console.error('❌ LocalStorage lleno. Limpiando registros antiguos...');
        
        // LIMPIEZA DE EMERGENCIA: Solo los últimos 100 registros
        try {
          const registrosEmergencia = productividad.slice(0, 100);
          localStorage.setItem("productividad-ot", JSON.stringify(registrosEmergencia));
          alert(
            '⚠️ ADVERTENCIA: LocalStorage lleno\n\n' +
            'Se han guardado solo los últimos 100 registros.\n\n' +
            'Recomendación: Exporta tu historial completo a Excel y limpia registros antiguos.'
          );
        } catch (e) {
          console.error('❌ No se pudo guardar ni con limpieza de emergencia:', e);
          alert('❌ Error crítico: No se puede guardar en localStorage. Exporta tus datos YA.');
        }
      } else {
        console.error('Error guardando productividad:', error);
      }
    }
  }, [productividad]);

  useEffect(() => {
    localStorage.setItem("zoho-config", JSON.stringify(zohoConfig));
  }, [zohoConfig]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setMostrarBusqueda(true);
      }
      if (e.key === "Escape" && mostrarBusqueda) {
        setMostrarBusqueda(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mostrarBusqueda]);

  useEffect(() => {
    const pendientes = productividad.filter((ot) => ot.estado === "Pendiente");
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
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleInputCCChange = (e) => {
    const value = e.target.value;
    setInputCC(value);

    if (value.length > 0) {
      const sugerencias = contactosGuardados.filter((contacto) => {
        const match =
          contacto.nombre.toLowerCase().includes(value.toLowerCase()) ||
          contacto.email.toLowerCase().includes(value.toLowerCase());
        const yaAgregado = formData.copiaCC.some((cc) => cc.email === contacto.email);
        return match && !yaAgregado;
      });
      setSugerenciasCC(sugerencias);
    } else {
      setSugerenciasCC([]);
    }
  };

  const agregarCC = (contacto) => {
    if (contacto.email && !formData.copiaCC.some((cc) => cc.email === contacto.email)) {
      setFormData((prev) => ({
        ...prev,
        copiaCC: [...prev.copiaCC, contacto],
      }));
    }
    setInputCC("");
    setSugerenciasCC([]);
  };

  const handleKeyDownCC = (e) => {
    if (e.key === "Enter" && inputCC.trim()) {
      e.preventDefault();

      if (sugerenciasCC.length > 0) {
        agregarCC(sugerenciasCC[0]);
      } else if (inputCC.includes("@")) {
        const nuevoContacto = {
          nombre: inputCC.split("@")[0],
          email: inputCC.trim(),
        };
        agregarCC(nuevoContacto);
      }
    }
  };

  const eliminarCC = (emailAEliminar) => {
    setFormData((prev) => ({
      ...prev,
      copiaCC: prev.copiaCC.filter((cc) => cc.email !== emailAEliminar),
    }));
  };

  const agregarMultiplesCC = (contactosSeleccionados) => {
    const nuevosCC = contactosSeleccionados.filter(
      (contacto) => !formData.copiaCC.some((cc) => cc.email === contacto.email),
    );
    if (nuevosCC.length > 0) {
      setFormData((prev) => ({
        ...prev,
        copiaCC: [...prev.copiaCC, ...nuevosCC],
      }));
    }
  };

  const handleArchivoZip = (e) => {
    const file = e.target.files[0];
    if (file) setArchivoZip(file);
  };

  const handleZohoConfigChange = (e) => {
    const { name, value } = e.target;
    setZohoConfig((prev) => ({ ...prev, [name]: value }));
  };

  // ========== PARAFISCALES ==========
  const agregarTecnicoMensual = () => {
    setParafiscalesMensuales((prev) => ({
      ...prev,
      tecnicos: [...prev.tecnicos, { nombre: "", cedula: "", eps: "", arl: "" }],
    }));
  };

  const actualizarTecnicoMensual = (index, campo, valor) => {
    setParafiscalesMensuales((prev) => ({
      ...prev,
      tecnicos: prev.tecnicos.map((tec, i) =>
        i === index ? { ...tec, [campo]: valor } : tec,
      ),
    }));
  };

  const eliminarTecnicoMensual = (index) => {
    setParafiscalesMensuales((prev) => ({
      ...prev,
      tecnicos: prev.tecnicos.filter((_, i) => i !== index),
    }));
  };

  const actualizarMesParafiscales = (nuevoMes) => {
    setParafiscalesMensuales((prev) => ({ ...prev, mes: nuevoMes }));
  };

  const importarParafiscalesExcel = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
      alert("⚠️ Por favor selecciona un archivo Excel");
      return;
    }

    try {
      const reader = new FileReader();
      reader.onload = (event) => {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        const nuevosTecnicos = jsonData.map((row) => ({
          nombre: row["Nombre"] || row["nombre"] || "",
          cedula: row["Cédula"] || row["Cedula"] || "",
          eps: row["EPS"] || row["eps"] || "",
          arl: row["ARL"] || row["arl"] || "",
        }));

        setParafiscalesMensuales((prev) => ({
          ...prev,
          tecnicos: nuevosTecnicos,
        }));
        alert(`✅ ${nuevosTecnicos.length} técnicos importados!`);
      };
      reader.readAsArrayBuffer(file);
    } catch (err) {
      console.error("Error al cargar Excel:", err);
      alert("❌ Error al cargar el archivo");
    }
    e.target.value = "";
  };

  // ========== CONTACTOS ==========
  const agregarNuevoContacto = () => {
    setContactosGuardados((prev) => [...prev, { nombre: "", email: "" }]);
  };

  const actualizarContacto = (index, campo, valor) => {
    setContactosGuardados((prev) =>
      prev.map((contacto, i) =>
        i === index ? { ...contacto, [campo]: valor } : contacto,
      ),
    );
  };

  const eliminarContacto = (index) => {
    setContactosGuardados((prev) => prev.filter((_, i) => i !== index));
  };

  const sincronizarContactosZoho = async () => {
    if (!zohoConfig.clientId || !zohoConfig.clientSecret || !zohoConfig.refreshToken) {
      alert("⚠️ Configura tus credenciales OAuth primero");
      setMostrarConfigZoho(true);
      return;
    }
  };

  // ========== GENERADORES ==========
  const generarAsunto = () => {
    return `CLARO COLOMBIA ENTREGA DE SERVICIO-${formData.cliente.toUpperCase()}- OT ${formData.numeroOT}`;
  };

  const generarCuerpo = () => {
    const dias = ["Domingo", "Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado"];
    const meses = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

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
${parafiscalesMensuales.tecnicos
  .map((tec) => `${String(tec.nombre || "").padEnd(35)} CC: ${String(tec.cedula || "").padEnd(15)} EPS: ${String(tec.eps || "").padEnd(20)} ARL: ${String(tec.arl || "")}`)
  .join("\n")}`;
  };

  const generarCuerpoHTML = () => {
    const dias = ["Domingo", "Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado"];
    const meses = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

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
        
        ${formData.tablaPersonalizada
          ? formData.tablaPersonalizada
          : `<table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse; width: 100%; margin: 20px 0;">
          <thead>
            <tr style="background-color: #e30613; color: white;">
              <th>Nombre</th>
              <th>Cedula</th>
              <th>EPS</th>
              <th>ARL</th>
            </tr>
          </thead>
          <tbody>
            ${parafiscalesMensuales.tecnicos
              .map((tec) => `
              <tr>
                <td>${tec.nombre}</td>
                <td>${tec.cedula}</td>
                <td>${tec.eps}</td>
                <td>${tec.arl}</td>
              </tr>
            `)
              .join("")}
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
    if (!formData.numeroOT) camposFaltantes.push("Número OT");
    if (!formData.cliente) camposFaltantes.push("Cliente");

    if (camposFaltantes.length > 0) {
      alert(`⚠️ Completa: ${camposFaltantes.join(", ")}`);
      return;
    }

    const asunto = generarAsunto();
    const cuerpo = generarCuerpo();
    navigator.clipboard
      .writeText(`ASUNTO:\n${asunto}\n\n${cuerpo}`)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
  };

  // 📥 FUNCIÓN PARA DESCARGAR PLANTILLA PDT MANUALMENTE
  const descargarPlantillaPDTManual = async (servicioPDT) => {
    try {
      if (!servicioPDT) {
        alert('⚠️ Selecciona un tipo de servicio PDT primero');
        return;
      }

      const plantilla = await obtenerPlantillaPDT(servicioPDT);

      if (!plantilla) {
        alert(`⚠️ No hay plantilla configurada para: ${servicioPDT}\n\nPor favor, sube la plantilla en Gestión de PDTs`);
        return;
      }

      if (!plantilla.base64) {
        alert("⚠️ La plantilla existe pero no tiene el archivo. Intenta subirla de nuevo.");
        return;
      }

      const datosOT = {
        numeroOT: formData.numeroOT || 'PLANTILLA',
        cliente: formData.cliente || 'CLIENTE',
        fecha: new Date().toLocaleDateString("es-CO"),
        ciudad: formData.ciudad || '',
        direccion: formData.direccion || '',
        servicio: servicioPDT,
      };

      const resultado = await generarPDT(datosOT, plantilla.base64);

      if (resultado.success) {
        console.log(`✅ Plantilla PDT descargada: ${resultado.nombreArchivo}`);
        alert(
          `✅ Plantilla descargada exitosamente\n\n` +
          `Archivo: ${resultado.nombreArchivo}\n\n` +
          `📝 Ahora:\n` +
          `1. Abre el archivo Excel\n` +
          `2. Completa todos los campos requeridos\n` +
          `3. Guarda el archivo\n` +
          `4. Adjúntalo al correo de la OT\n` +
          `5. Marca el checkbox "✅ Ya adjunté el PDT"`
        );
      } else {
        console.error("Error generando plantilla PDT:", resultado.error);
        alert(`⚠️ Error al descargar plantilla: ${resultado.error}`);
      }
    } catch (error) {
      console.error("Error en descarga manual PDT:", error);
      alert(`❌ Error inesperado: ${error.message}`);
    }
  };

  // Hacer la función accesible globalmente para el formulario
  React.useEffect(() => {
    window.descargarPlantillaPDTManual = descargarPlantillaPDTManual;
    return () => {
      delete window.descargarPlantillaPDTManual;
    };
  }, [formData.numeroOT, formData.cliente, formData.ciudad, formData.direccion]);

  const enviarCorreoZoho = async () => {
    // ⚠️ VALIDACIÓN OBLIGATORIA DE PDT
    if (formData.generarPDT === null || formData.generarPDT === undefined || formData.generarPDT === '') {
      alert(
        "🚨 VALIDACIÓN REQUERIDA 🚨\n\n" +
        "Debes indicar si necesitas o NO un PDT para esta OT.\n\n" +
        "Por favor:\n" +
        "1. Revisa la sección 'PDT - Plan Técnico de Despliegue'\n" +
        "2. Haz click en 'SÍ, necesito PDT' o 'NO necesito PDT'\n" +
        "3. Intenta enviar el correo de nuevo\n\n" +
        "⚠️ Esta validación es OBLIGATORIA para evitar olvidar PDTs importantes."
      );
      return;
    }

    // Si dijo SÍ pero no seleccionó servicio
    if (formData.generarPDT === true && !formData.servicioPDT) {
      alert(
        "⚠️ FALTA SELECCIONAR SERVICIO ⚠️\n\n" +
        "Marcaste que SÍ necesitas PDT, pero no has seleccionado el tipo de servicio.\n\n" +
        "Por favor:\n" +
        "1. Selecciona el tipo de servicio en el dropdown\n" +
        "2. Intenta enviar el correo de nuevo"
      );
      return;
    }

    // 🚨 VALIDACIONES ESTRICTAS DE PDT
    if (formData.generarPDT === null || formData.generarPDT === undefined || formData.generarPDT === '') {
      alert(
        "🚨 VALIDACIÓN REQUERIDA - PDT 🚨\n\n" +
        "Debes indicar si esta OT necesita o NO un PDT.\n\n" +
        "Por favor:\n" +
        "1. Revisa la sección 'PDT - Plan Técnico de Despliegue'\n" +
        "2. Haz click en 'SÍ, necesita PDT' o 'NO necesita PDT'\n" +
        "3. Intenta enviar el correo de nuevo\n\n" +
        "⚠️ Esta validación es OBLIGATORIA."
      );
      return;
    }

    // Si necesita PDT pero no seleccionó servicio
    if (formData.generarPDT === true && !formData.servicioPDT) {
      alert(
        "⚠️ FALTA SELECCIONAR SERVICIO PDT ⚠️\n\n" +
        "Marcaste que SÍ necesita PDT, pero no has seleccionado el tipo de servicio.\n\n" +
        "Por favor:\n" +
        "1. Selecciona el tipo de servicio en el dropdown\n" +
        "2. Descarga la plantilla PDT\n" +
        "3. Llénala y adjúntala al correo\n" +
        "4. Marca el checkbox de confirmación\n" +
        "5. Intenta enviar el correo de nuevo"
      );
      return;
    }

    // Si necesita PDT pero NO confirmó que lo subió
    if (formData.generarPDT === true && formData.servicioPDT && !formData.pdtSubido) {
      const confirmacionPDT = window.confirm(
        "🚨 VALIDACIÓN CRÍTICA - PDT 🚨\n\n" +
        `Esta OT REQUIERE un PDT del tipo "${formData.servicioPDT}"\n\n` +
        "❌ NO has marcado que adjuntaste el PDT\n\n" +
        "¿Realmente quieres enviar el correo SIN adjuntar el PDT?\n\n" +
        "⚠️ CONSECUENCIAS:\n" +
        "• El cliente NO recibirá el plan técnico\n" +
        "• Puede haber retrasos en la implementación\n" +
        "• Falta de documentación técnica obligatoria\n" +
        "• Incumplimiento de procesos\n\n" +
        "SI ya adjuntaste el PDT:\n" +
        '→ Click "Cancelar" y marca el checkbox de confirmación\n\n' +
        "SI NO has adjuntado el PDT:\n" +
        '→ Click "Cancelar", descarga la plantilla, llénala y adjúntala\n\n' +
        "¿Enviar de todas formas SIN PDT? (NO recomendado)"
      );

      if (!confirmacionPDT) {
        alert(
          "✅ Correo NO enviado.\n\n" +
          "📋 Por favor:\n" +
          `1. Descarga la plantilla PDT "${formData.servicioPDT}"\n` +
          "2. Llena la plantilla con los datos de la OT\n" +
          "3. Adjúntala al correo\n" +
          "4. Marca el checkbox '✅ Ya adjunté el PDT'\n" +
          "5. Intenta enviar de nuevo"
        );
        return;
      }

      // Segunda confirmación más severa
      const segundaConfirmacionPDT = window.confirm(
        "🚨🚨🚨 ÚLTIMA ADVERTENCIA - PDT 🚨🚨🚨\n\n" +
        "Estás a punto de enviar una OT que REQUIERE PDT sin adjuntarlo.\n\n" +
        "Esto es una FALTA GRAVE de documentación.\n\n" +
        "El correo quedará registrado como ENVIADO SIN PDT.\n\n" +
        "¿REALMENTE quieres continuar sin adjuntar el PDT?"
      );

      if (!segundaConfirmacionPDT) {
        alert("✅ Correo NO enviado.\n\n¡Gracias por verificar! Adjunta el PDT primero.");
        return;
      }

      alert(
        "⚠️ ENVIANDO SIN PDT ⚠️\n\n" +
        "El correo se enviará PERO quedará registrado que NO se adjuntó el PDT.\n\n" +
        "Recuerda enviar el PDT al cliente lo antes posible."
      );
    }

    // Si NO necesita PDT pero no confirmó
    if (formData.generarPDT === false && !formData.confirmoNoPDT) {
      alert(
        "⚠️ CONFIRMACIÓN REQUERIDA ⚠️\n\n" +
        "Has indicado que esta OT NO necesita PDT.\n\n" +
        "Debes confirmar explícitamente marcando el checkbox:\n" +
        '"✅ Confirmo que esta OT NO requiere PDT"\n\n' +
        "Tipo de servicio: " + formData.tipoServicio + "\n" +
        "Cliente: " + formData.cliente + "\n\n" +
        "Por favor marca el checkbox de confirmación antes de enviar."
      );
      return;
    }

    if (!formData.consensus) {
      const confirmacion = window.confirm(
        "⚠️⚠️⚠️ ATENCIÓN URGENTE ⚠️⚠️⚠️\n\n" +
          "🚨 NO HAS MARCADO QUE AGENDASTE EN CONSENSUS 🚨\n\n" +
          '❌ El checkbox de "Agendado en Consensus" está DESMARCADO\n\n' +
          "¿Ya agendaste esta OT en la plataforma de Consensus?\n\n" +
          '• SI ya la agendaste → Click "Cancelar", marca el checkbox y envía de nuevo\n' +
          '• NO la has agendado → Click "Cancelar" y NO ENVÍES ESTE CORREO hasta agendar\n\n' +
          "⚠️ ¿Estás ABSOLUTAMENTE SEGURO de que quieres enviar sin marcar Consensus?",
      );

      if (!confirmacion) {
        alert("✅ Correo NO enviado.\n\n📋 Por favor:\n1. Agenda la OT en Consensus\n2. Marca el checkbox\n3. Intenta enviar de nuevo");
        return;
      }

      const segundaConfirmacion = window.confirm(
        "🚨 ÚLTIMA ADVERTENCIA 🚨\n\n" +
          "Estás a punto de enviar un correo SIN agendar en Consensus.\n\n" +
          "Esto puede causar problemas graves:\n" +
          "• Descoordinación con el equipo\n" +
          "• Pérdida de seguimiento\n" +
          "• Incumplimiento de procesos\n\n" +
          "¿REALMENTE quieres continuar sin Consensus?",
      );

      if (!segundaConfirmacion) {
        alert("✅ Correo NO enviado.\n\n¡Gracias por verificar! Agenda en Consensus primero.");
        return;
      }

      alert("⚠️ ENVIANDO SIN CONSENSUS ⚠️\n\n" + "El correo se enviará pero quedará registrado que NO fue agendado en Consensus.\n\n" + "Recuerda agendarlo después para evitar problemas.");
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
        cc: formData.copiaCC.map((c) => c.email).join(", "),
        subject: generarAsunto(),
        content: generarCuerpoHTML(),
      };

      if (archivoZip) {
        const reader = new FileReader();
        reader.onload = async (e) => {
          emailData.attachments = [
            {
              attachmentName: archivoZip.name,
              content: e.target.result.split(",")[1],
            },
          ];
          await enviarCorreoConBackend(emailData);
        };
        reader.readAsDataURL(archivoZip);
      } else {
        await enviarCorreoConBackend(emailData);
      }
    } catch (err) {
      console.error("Error al enviar correo:", err);
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

  const registrarEnvio = async () => {
    // 🔍 VERIFICAR SI YA EXISTE EN PRODUCTIVIDAD (desde pendientes)
    const otExistente = productividad.find(ot => ot.numeroOT === formData.numeroOT);
    
    if (otExistente) {
      // ✅ ACTUALIZAR REGISTRO EXISTENTE (no crear duplicado)
      setProductividad((prev) => 
        prev.map((ot) => 
          ot.numeroOT === formData.numeroOT 
            ? {
                ...ot,
                ...formData, // Actualizar con nuevos datos
                fechaEnvio: new Date().toISOString(),
                estado: "Enviado",
                observaciones: formData.observaciones || ot.observaciones,
                actualizadoRecientemente: true
              }
            : ot
        )
      );
      console.log(`✅ OT ${formData.numeroOT} ACTUALIZADA de "Pendiente" a "Enviado" (sin duplicar)`);
    } else {
      // ✅ CREAR NUEVO REGISTRO (OT no existía antes)
      const nuevo = {
        id: Date.now(),
        ...formData,
        fechaEnvio: new Date().toISOString(),
        estado: "Enviado",
        rr: "",
      };
      setProductividad((prev) => [nuevo, ...prev]);
      console.log(`✅ OT ${formData.numeroOT} CREADA en productividad`);
    }
    
    setRegistrado(true);
    setTimeout(() => setRegistrado(false), 2000);

    // Quitar de pendientes si existe
    const pendientes = JSON.parse(localStorage.getItem("ots-pendientes") || "[]");
    const nuevosPendientes = pendientes.filter((p) => p.numeroOT !== formData.numeroOT);
    if (nuevosPendientes.length !== pendientes.length) {
      localStorage.setItem("ots-pendientes", JSON.stringify(nuevosPendientes));
      console.log(`✅ OT ${formData.numeroOT} quitada de pendientes automáticamente`);
      
      // 🆕 FORZAR ACTUALIZACIÓN del componente OTsPendientes
      setForceUpdatePendientes(prev => {
        const newValue = prev + 1;
        console.log(`🔄 Force update pendientes: ${prev} → ${newValue}`);
        return newValue;
      });
      
      // Alert temporal para debug
      setTimeout(() => {
        alert(`✅ OT ${formData.numeroOT} quitada de pendientes y productividad actualizada`);
      }, 100);
    }

    // 🗑️ DESCARGA AUTOMÁTICA DE PDT ELIMINADA
    // El usuario descarga manualmente cuando quiera usando el botón en el formulario

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
      servicioPDT: "",
      generarPDT: null,
      pdtSubido: false,
      confirmoNoPDT: false,
      observaciones: "",
      duracion: "4-8 horas",
      consensus: false,
      tablaPersonalizada: "",
      copiaCC: [],
    });
    setArchivoZip(null);
    
    // 🆕 RESETEAR INPUT FILE para permitir seleccionar archivos de nuevo
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // ========== REGISTRO RÁPIDO ==========
  const registrarRapido = async (datosRapidos) => {
    // 🔍 VERIFICAR SI YA EXISTE EN PRODUCTIVIDAD (desde pendientes)
    const otExistente = productividad.find(ot => ot.numeroOT === datosRapidos.numeroOT);
    
    if (otExistente) {
      // ✅ ACTUALIZAR REGISTRO EXISTENTE (no crear duplicado)
      setProductividad((prev) => 
        prev.map((ot) => 
          ot.numeroOT === datosRapidos.numeroOT 
            ? {
                ...ot,
                rr: datosRapidos.rr || ot.rr,
                cliente: datosRapidos.cliente,
                fecha: datosRapidos.fecha || ot.fecha,
                tipoServicio: datosRapidos.tipoServicio,
                observaciones: datosRapidos.observaciones || ot.observaciones,
                consensus: datosRapidos.consensus,
                generarPDT: datosRapidos.generarPDT,
                servicioPDT: datosRapidos.servicioPDT || "",
                fechaEnvio: new Date().toISOString(),
                estado: "Enviado",
                actualizadoRecientemente: true
              }
            : ot
        )
      );
      console.log(`✅ OT ${datosRapidos.numeroOT} ACTUALIZADA de "Pendiente" a "Enviado" (Registro Rápido - sin duplicar)`);
    } else {
      // ✅ CREAR NUEVO REGISTRO (OT no existía antes)
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
        observaciones: datosRapidos.observaciones || "📝 Registro rápido - Sin correo enviado",
        duracion: "",
        consensus: datosRapidos.consensus,
        generarPDT: datosRapidos.generarPDT,
        servicioPDT: datosRapidos.servicioPDT || "",
        tablaPersonalizada: "",
        copiaCC: [],
        fechaEnvio: new Date().toISOString(),
        estado: "Enviado",
      };
      setProductividad((prev) => [nuevoRegistro, ...prev]);
      console.log(`✅ OT ${datosRapidos.numeroOT} CREADA en productividad (Registro Rápido)`);
    }

    const pendientes = JSON.parse(localStorage.getItem("ots-pendientes") || "[]");
    const nuevosPendientes = pendientes.filter((p) => p.numeroOT !== datosRapidos.numeroOT);
    if (nuevosPendientes.length !== pendientes.length) {
      localStorage.setItem("ots-pendientes", JSON.stringify(nuevosPendientes));
      console.log(`✅ OT ${datosRapidos.numeroOT} quitada de pendientes automáticamente (Registro Rápido)`);
      
      // 🆕 FORZAR ACTUALIZACIÓN del componente OTsPendientes
      setForceUpdatePendientes(prev => {
        const newValue = prev + 1;
        console.log(`🔄 Force update pendientes (Registro Rápido): ${prev} → ${newValue}`);
        return newValue;
      });
      
      // Alert temporal para debug
      setTimeout(() => {
        alert(`✅ OT ${datosRapidos.numeroOT} quitada de pendientes y productividad actualizada`);
      }, 100);
    }

    // 🗑️ DESCARGA AUTOMÁTICA DE PDT ELIMINADA
    // El usuario descarga manualmente cuando quiera usando el botón en el formulario
  };

  const actualizarEstadoOT = (id, nuevoEstado) => {
    setProductividad((prev) => prev.map((ot) => (ot.id === id ? { ...ot, estado: nuevoEstado } : ot)));
  };

  const actualizarRR = (id, nuevoRR) => {
    setProductividad((prev) => prev.map((ot) => (ot.id === id ? { ...ot, rr: nuevoRR } : ot)));
  };

  // 🗑️ BORRAR TODAS LAS OTs DE PRODUCTIVIDAD
  const borrarTodasLasOTs = () => {
    const totalRegistros = productividad.length;
    
    if (totalRegistros === 0) {
      alert('✅ No hay registros en productividad.\n\nProductividad ya está vacía.');
      return;
    }
    
    if (confirm(
      `🗑️ BORRAR TODA LA PRODUCTIVIDAD\n\n` +
      `Se eliminarán TODOS los ${totalRegistros} registros de productividad.\n\n` +
      `⚠️ ADVERTENCIA:\n` +
      `• Esta acción es PERMANENTE\n` +
      `• NO se puede deshacer\n` +
      `• Se recomienda exportar a Excel primero\n\n` +
      `¿Estás SEGURO de que quieres borrar todo?`
    )) {
      // Doble confirmación
      if (confirm(
        `⚠️ ÚLTIMA CONFIRMACIÓN ⚠️\n\n` +
        `Vas a eliminar ${totalRegistros} registros.\n\n` +
        `¿Confirmas que quieres BORRAR TODO?\n\n` +
        `(Esta es tu última oportunidad para cancelar)`
      )) {
        setProductividad([]);
        alert(`✅ Productividad borrada completamente.\n\n${totalRegistros} registros eliminados.\n\nLocalStorage liberado.`);
      }
    }
  };

  // 🆕 ACTUALIZAR OBSERVACIONES Y FECHA
  const actualizarObservaciones = (id, nuevasObservaciones) => {
    const ahora = new Date().toISOString();
    setProductividad((prev) => 
      prev.map((ot) => 
        ot.id === id 
          ? { 
              ...ot, 
              observaciones: nuevasObservaciones,
              fechaEnvio: ahora, // ← Actualizar a HOY
              actualizadoRecientemente: true // ← Marcar como actualizado
            } 
          : ot
      )
    );
    
    alert(
      '✅ Observaciones actualizadas\n\n' +
      '📅 La fecha de esta OT se actualizó a HOY para reflejar la actividad reciente.\n\n' +
      '💡 Esta OT aparecerá ahora en los filtros de "Hoy" y "Semana".'
    );
  };

  const eliminarOT = (id) => {
    setProductividad((prev) => prev.filter((ot) => ot.id !== id));
  };

  const reutilizarCorreo = (ot) => {
    setFormData({
      ...ot,
      consensus: ot.consensus || false,
      copiaCC: ot.copiaCC || [],
    });
    setMostrarHistorial(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSeleccionarOT = (ot) => {
    setMostrarHistorial(true);
    setTimeout(() => {
      const elemento = document.getElementById(`ot-${ot.id}`);
      if (elemento) {
        elemento.scrollIntoView({ behavior: "smooth", block: "center" });
        elemento.classList.add("ring-4", "ring-blue-400");
        setTimeout(() => elemento.classList.remove("ring-4", "ring-blue-400"), 2000);
      }
    }, 300);
  };

  const handleOTAgendada = (otPendiente) => {
    setFormData((prev) => ({
      ...prev,
      numeroOT: otPendiente.numeroOT,
      cliente: otPendiente.cliente,
      ciudad: otPendiente.ciudad || "",
      direccion: otPendiente.direccion || "",
      contacto: otPendiente.contacto || "",
      telefono: otPendiente.telefono || "",
    }));

    setMostrarPendientes(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
    alert("📝 Formulario llenado con datos de la OT.\n\nCompleta los campos restantes (fecha, hora, correo destino) y envía el correo.");
  };

  // 🆕 REGISTRAR OT PENDIENTE EN PRODUCTIVIDAD
  const handleRegistrarPendienteEnProductividad = (registroProductividad) => {
    setProductividad((prev) => [registroProductividad, ...prev]);
    console.log(`✅ OT ${registroProductividad.numeroOT} registrada en productividad con estado "Pendiente"`);
  };

  // 🆕 ACTUALIZAR OT EN PRODUCTIVIDAD (sin crear duplicado)
  const handleActualizarProductividad = (id, cambios, eliminar = false) => {
    if (eliminar) {
      // Eliminar de productividad
      setProductividad((prev) => prev.filter((ot) => ot.id !== id));
      console.log(`✅ OT eliminada de productividad (ID: ${id})`);
    } else {
      // Actualizar campos
      setProductividad((prev) =>
        prev.map((ot) =>
          ot.id === id ? { ...ot, ...cambios } : ot
        )
      );
      console.log(`✅ OT actualizada en productividad (ID: ${id})`, cambios);
    }
  };

  const calcularEstadisticas = () => {
    const hoy = new Date().toDateString();
    const inicioSemana = new Date();
    inicioSemana.setDate(inicioSemana.getDate() - inicioSemana.getDay());
    const inicioMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

    return {
      hoyCount: productividad.filter((ot) => new Date(ot.fechaEnvio).toDateString() === hoy).length,
      semanaCount: productividad.filter((ot) => new Date(ot.fechaEnvio) >= inicioSemana).length,
      mesCount: productividad.filter((ot) => new Date(ot.fechaEnvio) >= inicioMes).length,
    };
  };

  const stats = calcularEstadisticas();

  // ========== RENDER ==========
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg mb-6 sticky top-0 z-40">
          <div className="p-6 md:p-8">
            <div className="flex justify-between items-center">
              <div className="flex-1 min-w-0">
                <h1 className="text-xl md:text-3xl font-bold text-gray-800 mb-1 truncate">
                  🚀 Generador de Correos - Agendamiento OT
                </h1>
                <p className="text-xs md:text-sm text-gray-600 hidden sm:block">Herramienta para automatizar correos de agendamiento</p>
              </div>

              {/* Botones Desktop */}
              <div className="hidden lg:flex gap-2 xl:gap-3 flex-shrink-0">
                <button onClick={() => setMostrarBusqueda(true)} className="bg-gray-700 hover:bg-gray-800 text-white font-semibold py-2 px-3 xl:px-4 rounded-lg flex items-center gap-2 transition text-sm" title="Búsqueda Rápida (Ctrl+K)">
                  <Search size={18} />
                  <span className="hidden xl:inline">Buscar</span>
                  <kbd className="hidden xl:inline-block ml-1 px-1.5 py-0.5 text-xs bg-gray-600 rounded">Ctrl+K</kbd>
                </button>

                <button onClick={() => setMostrarConfigZoho(!mostrarConfigZoho)} className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-3 xl:px-4 rounded-lg flex items-center gap-2 transition text-sm" title="Configuración Zoho">
                  <Settings size={18} />
                  <span className="hidden xl:inline">Config</span>
                </button>

                <button onClick={() => setMostrarGestionPDT(!mostrarGestionPDT)} className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-3 xl:px-4 rounded-lg flex items-center gap-2 transition text-sm" title="Gestión de PDTs">
                  <FileSpreadsheet size={18} />
                  <span className="hidden xl:inline">PDTs</span>
                </button>

                <button onClick={() => setMostrarHistorial(!mostrarHistorial)} className="bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-2 px-3 xl:px-4 rounded-lg transition text-sm" title="Historial de OTs">
                  📜 <span className="hidden xl:inline">Historial</span>
                </button>

                <button onClick={() => setMostrarAutocheck(!mostrarAutocheck)} className="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-3 xl:px-4 rounded-lg transition text-sm" title="Autocheck">
                  ✅ <span className="hidden xl:inline">Autocheck</span>
                </button>

                <button onClick={() => setMostrarParafiscalesMensuales(!mostrarParafiscalesMensuales)} className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-3 xl:px-4 rounded-lg transition text-sm" title="Parafiscales">
                  📋 <span className="hidden xl:inline">Parafiscales</span>
                </button>

                <button onClick={() => setMostrarGestionContactos(!mostrarGestionContactos)} className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-3 xl:px-4 rounded-lg transition text-sm" title="Gestión de Contactos">
                  📧 <span className="hidden xl:inline">Contactos</span>
                </button>

                <button onClick={() => setMostrarZonificador(!mostrarZonificador)} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-3 xl:px-4 rounded-lg transition text-sm flex items-center gap-2" title="Zonificador Nacional">
                  <Map size={18} />
                  <span className="hidden xl:inline">Zonas</span>
                </button>

                <button 
                  onClick={borrarTodasLasOTs} 
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-3 xl:px-4 rounded-lg transition text-sm flex items-center gap-2" 
                  title="Borrar TODA la productividad"
                >
                  🗑️ <span className="hidden xl:inline">Borrar Todo</span>
                </button>

                <button onClick={() => setMostrarGuiaEscalamiento(!mostrarGuiaEscalamiento)} className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-3 xl:px-4 rounded-lg transition text-sm flex items-center gap-2" title="Guía de Escalamiento">
                  <BookOpen size={18} />
                  <span className="hidden xl:inline">Escalar</span>
                </button>

                <button onClick={() => setMostrarPendientes(!mostrarPendientes)} className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-semibold py-2 px-3 xl:px-4 rounded-lg transition shadow-lg flex items-center gap-2 text-sm" title="OTs Pendientes">
                  <Clock size={18} />
                  <span className="hidden xl:inline">Pendientes</span>
                  {(() => {
                    const count = JSON.parse(localStorage.getItem("ots-pendientes") || "[]").length;
                    return count > 0 ? <span className="bg-white text-orange-600 rounded-full px-2 py-0.5 text-xs font-bold">{count}</span> : null;
                  })()}
                </button>
              </div>

              {/* Botón Menú Móvil */}
              <button onClick={() => setMostrarMenu(!mostrarMenu)} className="lg:hidden ml-4 p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition" aria-label="Menú">
                {mostrarMenu ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Menú Móvil */}
          {mostrarMenu && (
            <div className="lg:hidden border-t border-gray-200 bg-gray-50">
              <div className="p-4 space-y-2">
                <button onClick={() => { setMostrarBusqueda(true); setMostrarMenu(false); }} className="w-full bg-gray-700 hover:bg-gray-800 text-white font-semibold py-3 px-4 rounded-lg flex items-center gap-3 transition">
                  <Search size={20} />
                  Búsqueda Rápida
                  <kbd className="ml-auto px-2 py-1 text-xs bg-gray-600 rounded">Ctrl+K</kbd>
                </button>

                <button onClick={() => { setMostrarConfigZoho(!mostrarConfigZoho); setMostrarMenu(false); }} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-lg flex items-center gap-3 transition">
                  <Settings size={20} />
                  Configuración Zoho
                </button>

                <button onClick={() => { setMostrarGestionPDT(!mostrarGestionPDT); setMostrarMenu(false); }} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-4 rounded-lg flex items-center gap-3 transition">
                  <FileSpreadsheet size={20} />
                  Gestión de PDTs
                </button>

                <button onClick={() => { setMostrarHistorial(!mostrarHistorial); setMostrarMenu(false); }} className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-3 px-4 rounded-lg flex items-center gap-3 transition">
                  📜 Historial
                </button>

                <button onClick={() => { setMostrarAutocheck(!mostrarAutocheck); setMostrarMenu(false); }} className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-4 rounded-lg flex items-center gap-3 transition">
                  ✅ Autocheck
                </button>

                <button onClick={() => { setMostrarParafiscalesMensuales(!mostrarParafiscalesMensuales); setMostrarMenu(false); }} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-lg flex items-center gap-3 transition">
                  📋 Parafiscales
                </button>

                <button onClick={() => { setMostrarGestionContactos(!mostrarGestionContactos); setMostrarMenu(false); }} className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg flex items-center gap-3 transition">
                  📧 Contactos
                </button>

                <button onClick={() => { setMostrarZonificador(!mostrarZonificador); setMostrarMenu(false); }} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg flex items-center gap-3 transition">
                  <Map size={20} />
                  Zonificador Nacional
                </button>

                <button onClick={() => { setMostrarGuiaEscalamiento(!mostrarGuiaEscalamiento); setMostrarMenu(false); }} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-lg flex items-center gap-3 transition">
                  <BookOpen size={20} />
                  Guía de Escalamiento
                </button>

                <button onClick={() => { setMostrarPendientes(!mostrarPendientes); setMostrarMenu(false); }} className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-semibold py-3 px-4 rounded-lg flex items-center gap-3 transition shadow-lg">
                  <Clock size={20} />
                  OTs Pendientes
                  {(() => {
                    const count = JSON.parse(localStorage.getItem("ots-pendientes") || "[]").length;
                    return count > 0 ? <span className="ml-auto bg-white text-orange-600 rounded-full px-2 py-0.5 text-xs font-bold">{count}</span> : null;
                  })()}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modales */}
        {mostrarHistorial && (
          <FloatingModal isOpen={mostrarHistorial} onClose={() => setMostrarHistorial(false)} title="Historial de OTs" icon="📜" color="cyan">
            <Historial productividad={productividad} onReutilizar={reutilizarCorreo} onClose={() => setMostrarHistorial(false)} />
          </FloatingModal>
        )}

        {mostrarAutocheck && (
          <FloatingModal isOpen={mostrarAutocheck} onClose={() => setMostrarAutocheck(false)} title="Autocheck de OTs" icon="✅" color="orange" defaultWidth="max-w-6xl">
            <Autocheck />
          </FloatingModal>
        )}

        {mostrarGestionContactos && (
          <FloatingModal isOpen={mostrarGestionContactos} onClose={() => setMostrarGestionContactos(false)} title="Gestión de Contactos" icon="📧" color="green">
            <GestionContactos contactosGuardados={contactosGuardados} onAgregarNuevo={agregarNuevoContacto} onActualizar={actualizarContacto} onEliminar={eliminarContacto} onSincronizarZoho={sincronizarContactosZoho} onClose={() => setMostrarGestionContactos(false)} />
          </FloatingModal>
        )}

        {mostrarConfigZoho && (
          <FloatingModal isOpen={mostrarConfigZoho} onClose={() => setMostrarConfigZoho(false)} title="Configuración Zoho" icon="⚙️" color="indigo" defaultWidth="max-w-2xl">
            <ConfiguracionZoho zohoConfig={zohoConfig} onConfigChange={handleZohoConfigChange} onClose={() => setMostrarConfigZoho(false)} />
          </FloatingModal>
        )}

        {mostrarParafiscalesMensuales && (
          <FloatingModal isOpen={mostrarParafiscalesMensuales} onClose={() => setMostrarParafiscalesMensuales(false)} title="Parafiscales Mensuales" icon="📋" color="purple" defaultWidth="max-w-6xl">
            <ParafiscalesMensuales parafiscalesMensuales={parafiscalesMensuales} onActualizarMes={actualizarMesParafiscales} onAgregarTecnico={agregarTecnicoMensual} onActualizarTecnico={actualizarTecnicoMensual} onEliminarTecnico={eliminarTecnicoMensual} onImportarExcel={importarParafiscalesExcel} onClose={() => setMostrarParafiscalesMensuales(false)} />
          </FloatingModal>
        )}

        {/* Estadísticas */}
        <Estadisticas hoyCount={stats.hoyCount} semanaCount={stats.semanaCount} mesCount={stats.mesCount} />

        {/* Registro Rápido */}
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
            fileInputRef={fileInputRef}
            onEliminarArchivo={() => {
              setArchivoZip(null);
              if (fileInputRef.current) {
                fileInputRef.current.value = '';
              }
            }}
            onCopiarCorreo={copiarCorreo}
            onEnviarCorreo={enviarCorreoZoho}
            copied={copied}
            registrado={registrado}
          />

          <div className="space-y-6">
            <VistaPrevia asunto={generarAsunto()} cuerpo={generarCuerpo()} />
            <Productividad 
              productividad={productividad} 
              onActualizarEstado={actualizarEstadoOT} 
              onActualizarRR={actualizarRR} 
              onActualizarObservaciones={actualizarObservaciones}
              onEliminarOT={eliminarOT} 
            />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              💡 Los datos se guardan automáticamente en tu navegador
            </p>
            <div className="text-xs text-gray-500">
              📊 Registros en productividad: <span className="font-bold text-blue-600">{productividad.length}</span>
              {productividad.length > 400 && (
                <span className="ml-2 text-orange-600 font-semibold">
                  ⚠️ Considera limpiar registros antiguos
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Modales adicionales */}
        {mostrarSelectorMultiple && (
          <ModalSelectorCC contactosGuardados={contactosGuardados} copiaCC={formData.copiaCC} onAgregar={agregarMultiplesCC} onClose={() => setMostrarSelectorMultiple(false)} onAbrirGestionContactos={() => { setMostrarSelectorMultiple(false); setMostrarGestionContactos(true); }} />
        )}

        {mostrarPendientes && (
          <OTsPendientes 
            key={forceUpdatePendientes}
            onClose={() => setMostrarPendientes(false)} 
            onOTAgendada={handleOTAgendada} 
            onRegistrarEnProductividad={handleRegistrarPendienteEnProductividad}
            onActualizarProductividad={handleActualizarProductividad}
          />
        )}

        {mostrarZonificador && (
          <FloatingModal isOpen={mostrarZonificador} onClose={() => setMostrarZonificador(false)} title="Zonificador Nacional - Buscador de Aliados" icon="🗺️" color="blue" defaultWidth="max-w-6xl" defaultHeight="max-h-[90vh]">
            <ZonificadorMejorado />
          </FloatingModal>
        )}

        {mostrarBusqueda && <BusquedaRapida productividad={productividad} onSeleccionarOT={handleSeleccionarOT} onClose={() => setMostrarBusqueda(false)} />}

        {mostrarGuiaEscalamiento && <GuiaEscalamiento onClose={() => setMostrarGuiaEscalamiento(false)} />}

        {mostrarGestionPDT && <GestionPDT onClose={() => setMostrarGestionPDT(false)} />}
      </div>
    </div>
  );
};

export default AgendamientoOT;