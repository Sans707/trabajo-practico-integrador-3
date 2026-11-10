

export const adminMiddleware = (req, res, next) => {
    try {
       
        if (!req.user) {
            return res.status(401).json({
                msg: "No autorizado. Debes iniciar sesión"
            });
        }

      
        if (req.user.role !== "admin") {
            return res.status(403).json({
                msg: "Acceso denegado. Solo los administradores pueden realizar esta acción"
            });
        }

       
        next();

    } catch (error) {
        console.error("Error al verificar permisos de administrador:", error);

        return res.status(500).json({
            msg: "Error interno al verificar permisos"
        });
    }
};
