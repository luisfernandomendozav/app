import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const tipo = searchParams.get('tipo') || 'telefono'
  const q = searchParams.get('q')?.trim()

  if (!q || q.length < 3) {
    return NextResponse.json({ error: 'Mínimo 3 caracteres' }, { status: 400 })
  }

  try {
    let rows: unknown[]

    if (tipo === 'telefono') {
      const num = q.replace(/\D/g, '')
      rows = await query(
        `SELECT telefono, nombre, municipio, estado, calle, colonia, cp, clave_estado
         FROM telcel WHERE telefono = $1 LIMIT 50`,
        [num]
      )
    } else if (tipo === 'nombre_telcel') {
      rows = await query(
        `SELECT telefono, nombre, municipio, estado, calle, colonia, cp
         FROM telcel WHERE nombre ILIKE $1 LIMIT 50`,
        [`%${q}%`]
      )
    } else if (tipo === 'curp') {
      rows = await query(
        `SELECT nombre, paterno, materno, curp, fecnac, sexo, calle, ext_num, colonia, cp
         FROM ines WHERE curp = $1 LIMIT 20`,
        [q.toUpperCase()]
      )
    } else if (tipo === 'nombre_ines') {
      const parts = q.toUpperCase().split(' ')
      rows = await query(
        `SELECT nombre, paterno, materno, curp, fecnac, sexo, calle, ext_num, colonia, cp
         FROM ines WHERE paterno ILIKE $1 OR nombre ILIKE $1 LIMIT 50`,
        [`%${parts[0]}%`]
      )
    } else if (tipo === 'cruce') {
      rows = await query(
        `SELECT t.telefono, i.nombre, i.paterno, i.materno, i.curp, i.fecnac,
                i.calle, i.colonia, t.municipio, t.estado
         FROM telcel t JOIN ines i ON t.id_doc = i.curp
         WHERE i.curp = $1 LIMIT 20`,
        [q.toUpperCase()]
      )
    } else {
      return NextResponse.json({ error: 'Tipo inválido' }, { status: 400 })
    }

    return NextResponse.json({ results: rows, count: rows.length })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Error en la base de datos' }, { status: 500 })
  }
}
