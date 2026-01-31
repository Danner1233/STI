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
  Bell,
  ChevronDown,
} from "lucide-react";

// Logo SVG Component
const LogoEmpresa = ({ imageUrl }) => (
  <svg
    width="50"
    height="50"
    viewBox="0 0 100 100"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Definimos el recorte circular */}
    <defs>
      <clipPath id="circleClip">
        <circle cx="50" cy="50" r="45" />
      </clipPath>
    </defs>

    {/* Círculo de fondo */}
    <circle
      cx="50"
      cy="50"
      r="48"
      fill="#1E40AF"
      stroke="#F97316"
      strokeWidth="2"
    />

    {/* Imagen dentro del círculo */}
    {imageUrl && (
      <image
        href={imageUrl}
        x="5"
        y="5"
        width="90"
        height="90"
        clipPath="url(#circleClip)"
        preserveAspectRatio="xMidYMid slice"
      />
    )}
  </svg>
);

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
    generarPDT: null,
    pdtSubido: false,
    confirmoNoPDT: false,
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
  const [forceUpdatePendientes, setForceUpdatePendientes] = useState(0);
  const [mostrarMenu, setMostrarMenu] = useState(false);
  const [mostrarZonificador, setMostrarZonificador] = useState(false);
  const [mostrarBusqueda, setMostrarBusqueda] = useState(false);
  const [mostrarGuiaEscalamiento, setMostrarGuiaEscalamiento] = useState(false);
  const [mostrarGestionPDT, setMostrarGestionPDT] = useState(false);

  const [archivoZip, setArchivoZip] = useState(null);
  const fileInputRef = useRef(null);
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
      const registrosLimitados = productividad.slice(0, 500);
      localStorage.setItem("productividad-ot", JSON.stringify(registrosLimitados));
      
      if (productividad.length > 500) {
        console.warn(`⚠️ Productividad tiene ${productividad.length} registros. Solo se guardan los últimos 500.`);
      }
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        console.error('❌ LocalStorage lleno. Limpiando registros antiguos...');
        
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

  React.useEffect(() => {
    window.descargarPlantillaPDTManual = descargarPlantillaPDTManual;
    return () => {
      delete window.descargarPlantillaPDTManual;
    };
  }, [formData.numeroOT, formData.cliente, formData.ciudad, formData.direccion]);

  const enviarCorreoZoho = async () => {
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
    const otExistente = productividad.find(ot => ot.numeroOT === formData.numeroOT);
    
    if (otExistente) {
      setProductividad((prev) => 
        prev.map((ot) => 
          ot.numeroOT === formData.numeroOT 
            ? {
                ...ot,
                ...formData,
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

    const pendientes = JSON.parse(localStorage.getItem("ots-pendientes") || "[]");
    const nuevosPendientes = pendientes.filter((p) => p.numeroOT !== formData.numeroOT);
    if (nuevosPendientes.length !== pendientes.length) {
      localStorage.setItem("ots-pendientes", JSON.stringify(nuevosPendientes));
      console.log(`✅ OT ${formData.numeroOT} quitada de pendientes automáticamente`);
      
      setForceUpdatePendientes(prev => {
        const newValue = prev + 1;
        console.log(`🔄 Force update pendientes: ${prev} → ${newValue}`);
        return newValue;
      });
      
      setTimeout(() => {
        alert(`✅ OT ${formData.numeroOT} quitada de pendientes y productividad actualizada`);
      }, 100);
    }

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
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const registrarRapido = async (datosRapidos) => {
    const otExistente = productividad.find(ot => ot.numeroOT === datosRapidos.numeroOT);
    
    if (otExistente) {
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
      
      setForceUpdatePendientes(prev => {
        const newValue = prev + 1;
        console.log(`🔄 Force update pendientes (Registro Rápido): ${prev} → ${newValue}`);
        return newValue;
      });
      
      setTimeout(() => {
        alert(`✅ OT ${datosRapidos.numeroOT} quitada de pendientes y productividad actualizada`);
      }, 100);
    }
  };

  const actualizarEstadoOT = (id, nuevoEstado) => {
    setProductividad((prev) => prev.map((ot) => (ot.id === id ? { ...ot, estado: nuevoEstado } : ot)));
  };

  const actualizarRR = (id, nuevoRR) => {
    setProductividad((prev) => prev.map((ot) => (ot.id === id ? { ...ot, rr: nuevoRR } : ot)));
  };

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

  const actualizarObservaciones = (id, nuevasObservaciones) => {
    const ahora = new Date().toISOString();
    setProductividad((prev) => 
      prev.map((ot) => 
        ot.id === id 
          ? { 
              ...ot, 
              observaciones: nuevasObservaciones,
              fechaEnvio: ahora,
              actualizadoRecientemente: true
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

  const handleRegistrarPendienteEnProductividad = (registroProductividad) => {
    setProductividad((prev) => [registroProductividad, ...prev]);
    console.log(`✅ OT ${registroProductividad.numeroOT} registrada en productividad con estado "Pendiente"`);
  };

  const handleActualizarProductividad = (id, cambios, eliminar = false) => {
    if (eliminar) {
      setProductividad((prev) => prev.filter((ot) => ot.id !== id));
      console.log(`✅ OT eliminada de productividad (ID: ${id})`);
    } else {
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
  const pendientesCount = JSON.parse(localStorage.getItem("ots-pendientes") || "[]").length;

  // ========== RENDER ==========
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-orange-50">
      {/* Header Profesional con Gradiente Corporativo */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-orange-600 shadow-2xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto">
          <div className="px-4 py-4 md:px-6 md:py-5">
            <div className="flex items-center justify-between gap-4">
              {/* Logo y Título */}
              <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
                <div className="flex-shrink-0">
                  <LogoEmpresa />
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-lg md:text-2xl lg:text-3xl font-bold text-white truncate">
                    Sistema de Agendamiento OT
                  </h1>
                  <p className="text-xs md:text-sm text-blue-100 hidden sm:block mt-0.5">
                    Gestión profesional de órdenes de trabajo
                  </p>
                </div>
              </div>

              {/* Notificaciones (Desktop) */}
              <div className="hidden lg:flex items-center gap-3">
                {pendientesCount > 0 && (
                  <button
                    onClick={() => setMostrarPendientes(true)}
                    className="relative bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
                  >
                    <Bell size={18} className="animate-pulse" />
                    <span className="font-semibold">{pendientesCount}</span>
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-bounce">
                      !
                    </span>
                  </button>
                )}
                
                {/* Botón de Búsqueda */}
                <button
                  onClick={() => setMostrarBusqueda(true)}
                  className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-all flex items-center gap-2 backdrop-blur-sm"
                >
                  <Search size={18} />
                  <kbd className="hidden xl:inline-block px-2 py-0.5 text-xs bg-white/20 rounded">
                    Ctrl+K
                  </kbd>
                </button>

                {/* Menú Dropdown (Desktop) */}
                <div className="relative group">
                  <button className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-all flex items-center gap-2 backdrop-blur-sm">
                    <Settings size={18} />
                    <span className="hidden xl:inline">Herramientas</span>
                    <ChevronDown size={16} />
                  </button>
                  
                  {/* Dropdown Menu */}
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="py-2">
                      <button
                        onClick={() => setMostrarConfigZoho(true)}
                        className="w-full text-left px-4 py-2 hover:bg-blue-50 flex items-center gap-3 text-gray-700"
                      >
                        <Settings size={16} className="text-blue-600" />
                        <span>Configuración Zoho</span>
                      </button>
                      <button
                        onClick={() => setMostrarGestionPDT(true)}
                        className="w-full text-left px-4 py-2 hover:bg-blue-50 flex items-center gap-3 text-gray-700"
                      >
                        <FileSpreadsheet size={16} className="text-emerald-600" />
                        <span>Gestión PDTs</span>
                      </button>
                      <button
                        onClick={() => setMostrarHistorial(true)}
                        className="w-full text-left px-4 py-2 hover:bg-blue-50 flex items-center gap-3 text-gray-700"
                      >
                        <span className="text-lg">📜</span>
                        <span>Historial</span>
                      </button>
                      <button
                        onClick={() => setMostrarAutocheck(true)}
                        className="w-full text-left px-4 py-2 hover:bg-blue-50 flex items-center gap-3 text-gray-700"
                      >
                        <span className="text-lg">✅</span>
                        <span>Autocheck</span>
                      </button>
                      <button
                        onClick={() => setMostrarParafiscalesMensuales(true)}
                        className="w-full text-left px-4 py-2 hover:bg-blue-50 flex items-center gap-3 text-gray-700"
                      >
                        <span className="text-lg">📋</span>
                        <span>Parafiscales</span>
                      </button>
                      <button
                        onClick={() => setMostrarGestionContactos(true)}
                        className="w-full text-left px-4 py-2 hover:bg-blue-50 flex items-center gap-3 text-gray-700"
                      >
                        <span className="text-lg">📧</span>
                        <span>Contactos</span>
                      </button>
                      <button
                        onClick={() => setMostrarZonificador(true)}
                        className="w-full text-left px-4 py-2 hover:bg-blue-50 flex items-center gap-3 text-gray-700"
                      >
                        <Map size={16} className="text-blue-600" />
                        <span>Zonificador</span>
                      </button>
                      <button
                        onClick={() => setMostrarGuiaEscalamiento(true)}
                        className="w-full text-left px-4 py-2 hover:bg-blue-50 flex items-center gap-3 text-gray-700"
                      >
                        <BookOpen size={16} className="text-purple-600" />
                        <span>Guía Escalamiento</span>
                      </button>
                      <div className="border-t border-gray-200 my-2"></div>
                      <button
                        onClick={borrarTodasLasOTs}
                        className="w-full text-left px-4 py-2 hover:bg-red-50 flex items-center gap-3 text-red-600"
                      >
                        <span className="text-lg">🗑️</span>
                        <span>Borrar Todo</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Botón Menú Móvil */}
              <button
                onClick={() => setMostrarMenu(!mostrarMenu)}
                className="lg:hidden p-2 rounded-lg bg-white/10 hover:bg-white/20 transition backdrop-blur-sm"
              >
                {mostrarMenu ? <X size={24} className="text-white" /> : <Menu size={24} className="text-white" />}
              </button>
            </div>
          </div>

          {/* Menú Móvil Expandible */}
          {mostrarMenu && (
            <div className="lg:hidden border-t border-white/20 bg-gradient-to-b from-blue-800 to-blue-900">
              <div className="px-4 py-4 space-y-2 max-h-[70vh] overflow-y-auto">
                {pendientesCount > 0 && (
                  <button
                    onClick={() => { setMostrarPendientes(true); setMostrarMenu(false); }}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-between transition shadow-lg"
                  >
                    <span className="flex items-center gap-3">
                      <Bell size={20} />
                      OTs Pendientes
                    </span>
                    <span className="bg-white text-orange-600 rounded-full px-3 py-1 text-sm font-bold">
                      {pendientesCount}
                    </span>
                  </button>
                )}
                
                <button
                  onClick={() => { setMostrarBusqueda(true); setMostrarMenu(false); }}
                  className="w-full bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-4 rounded-lg flex items-center gap-3 transition backdrop-blur-sm"
                >
                  <Search size={20} />
                  Búsqueda Rápida
                </button>

                <div className="h-px bg-white/20 my-2"></div>

                <button onClick={() => { setMostrarConfigZoho(true); setMostrarMenu(false); }} className="w-full bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-4 rounded-lg flex items-center gap-3 transition backdrop-blur-sm">
                  <Settings size={20} />
                  Configuración Zoho
                </button>

                <button onClick={() => { setMostrarGestionPDT(true); setMostrarMenu(false); }} className="w-full bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-4 rounded-lg flex items-center gap-3 transition backdrop-blur-sm">
                  <FileSpreadsheet size={20} />
                  Gestión PDTs
                </button>

                <button onClick={() => { setMostrarHistorial(true); setMostrarMenu(false); }} className="w-full bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-4 rounded-lg flex items-center gap-3 transition backdrop-blur-sm">
                  📜 Historial
                </button>

                <button onClick={() => { setMostrarAutocheck(true); setMostrarMenu(false); }} className="w-full bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-4 rounded-lg flex items-center gap-3 transition backdrop-blur-sm">
                  ✅ Autocheck
                </button>

                <button onClick={() => { setMostrarParafiscalesMensuales(true); setMostrarMenu(false); }} className="w-full bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-4 rounded-lg flex items-center gap-3 transition backdrop-blur-sm">
                  📋 Parafiscales
                </button>

                <button onClick={() => { setMostrarGestionContactos(true); setMostrarMenu(false); }} className="w-full bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-4 rounded-lg flex items-center gap-3 transition backdrop-blur-sm">
                  📧 Contactos
                </button>

                <button onClick={() => { setMostrarZonificador(true); setMostrarMenu(false); }} className="w-full bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-4 rounded-lg flex items-center gap-3 transition backdrop-blur-sm">
                  <Map size={20} />
                  Zonificador
                </button>

                <button onClick={() => { setMostrarGuiaEscalamiento(true); setMostrarMenu(false); }} className="w-full bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-4 rounded-lg flex items-center gap-3 transition backdrop-blur-sm">
                  <BookOpen size={20} />
                  Guía Escalamiento
                </button>

                <div className="h-px bg-white/20 my-2"></div>

                <button onClick={() => { borrarTodasLasOTs(); setMostrarMenu(false); }} className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-200 font-semibold py-3 px-4 rounded-lg flex items-center gap-3 transition backdrop-blur-sm border border-red-400/30">
                  🗑️ Borrar Productividad
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="max-w-7xl mx-auto px-4 py-6">
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

        {/* Estadísticas con diseño corporativo */}
        <div className="mb-6">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-blue-100">
            <div className="bg-gradient-to-r from-blue-600 to-orange-500 px-6 py-3">
              <h2 className="text-white font-bold text-lg">Estadísticas de Productividad</h2>
            </div>
            <div className="p-6">
              <Estadisticas hoyCount={stats.hoyCount} semanaCount={stats.semanaCount} mesCount={stats.mesCount} />
            </div>
          </div>
        </div>

        {/* Registro Rápido */}
        <div className="mb-6">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-orange-100">
            <div className="bg-gradient-to-r from-orange-500 to-blue-600 px-6 py-3">
              <h2 className="text-white font-bold text-lg">⚡ Registro Rápido</h2>
            </div>
            <div className="p-6">
              <RegistroRapido onRegistrar={registrarRapido} />
            </div>
          </div>
        </div>

        {/* Formulario y Vista Previa */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-blue-100">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3">
              <h2 className="text-white font-bold text-lg">📝 Formulario de OT</h2>
            </div>
            <div className="p-6">
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
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-orange-100">
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-3">
                <h2 className="text-white font-bold text-lg">👁️ Vista Previa</h2>
              </div>
              <div className="p-6">
                <VistaPrevia asunto={generarAsunto()} cuerpo={generarCuerpo()} />
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-blue-100">
              <div className="bg-gradient-to-r from-blue-700 to-blue-800 px-6 py-3">
                <h2 className="text-white font-bold text-lg">📊 Productividad Reciente</h2>
              </div>
              <div className="p-6">
                <Productividad 
                  productividad={productividad} 
                  onActualizarEstado={actualizarEstadoOT} 
                  onActualizarRR={actualizarRR} 
                  onActualizarObservaciones={actualizarObservaciones}
                  onEliminarOT={eliminarOT} 
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer Corporativo */}
        <div className="mt-8 bg-gradient-to-r from-blue-900 to-orange-600 rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-white">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8">
                  <svg viewBox="0 0 100 100" fill="none">
                    <circle cx="50" cy="50" r="48" fill="white" fillOpacity="0.2"/>
                    <path d="M 35 30 Q 50 25 65 30 Q 70 35 65 40 Q 50 45 50 50 Q 50 55 65 60 Q 70 65 65 70 Q 50 75 35 70" 
                          stroke="white" strokeWidth="4" fill="none" strokeLinecap="round"/>
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold">Sistema de Agendamiento OT</p>
                  <p className="text-xs opacity-80">Gestión Profesional de Órdenes de Trabajo</p>
                </div>
              </div>
              
              <div className="text-center md:text-right">
                <p className="text-sm font-semibold">
                  📊 Registros: <span className="text-orange-300">{productividad.length}</span>
                </p>
                {productividad.length > 400 && (
                  <p className="text-xs text-orange-200 mt-1">
                    ⚠️ Considera exportar y limpiar datos antiguos
                  </p>
                )}
              </div>
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