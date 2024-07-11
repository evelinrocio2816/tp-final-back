function deleteUser(uid) {

    fetch(`/api/user/${uid}/delete`, { 
    method: 'DELETE'
    })
    .then(response => {
    if (!response.ok) {
    
    console.log('Error al eliminar el Usuario');
    return Swal.fire({
    icon: 'error',
    title: '¡Ups!',
    text: 'Ha ocurrido un error y no se pudo eliminar el usuario',
    confirmButtonText: 'Aceptar'
    }).then(() => {
    location.reload();
    });
    }
    Swal.fire({
    icon: 'success',
    title: '¡Éxito!',
    text: 'Usuario eliminado con éxito',
    confirmButtonText: 'Aceptar'
    }).then(() => {
    location.reload(); 
    });
    })
    .catch(error => {
    console.error('Error:', error);
    Swal.fire({
    icon: 'error',
    title: '¡Error!',
    text: error.message,
    confirmButtonText: 'Aceptar'
    });
    });
    }
    function changeRole(uid) { 
        fetch(`/api/user/premium/${uid}`, { 
            method: 'POST'
        })
        .then(response => {
            if (!response.ok) {
                console.log('Error al Cambiar de Rol, verifique la documentación de usuario');
                return Swal.fire({ 
                    icon: 'error',
                    title: '¡Ups!',
                    text: 'Este usuario no ha cargado la documentación requerida',
                    confirmButtonText: 'Aceptar'
                }).then(() => {
                    location.reload();
                });
            }
            
            return Swal.fire({
                icon: 'success',
                title: '¡Éxito!',
                text: 'Rol de Usuario cambiado con éxito',
                confirmButtonText: 'Aceptar'
            }).then(() => {
                location.reload();
            });
        })
        .catch(error => {    
            console.error('Error:', error);
            Swal.fire({
                icon: 'error',
                title: '¡Error!',
                text: error.message,
                confirmButtonText: 'Aceptar'
            });
        });
    }
    